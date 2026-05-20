/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Like } from 'typeorm';
import {
  CourseAssignment,
  AssignmentStatus,
} from '../course-assignments/entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Notification } from '../notifications/entities/Notification.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private isRunning = false;

  constructor(
    @InjectRepository(CourseAssignment)
    private readonly caRepo: Repository<CourseAssignment>,
    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 0 0 * * *', {
    name: 'check-overdue-assignments',
    timeZone: 'Europe/Moscow',
  })
  async handleOverdueCheck() {
    let res: unknown;
    let blockedCount = 0;
    if (this.isRunning) {
      this.logger.warn('Previous overdue check still running, skipping');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting daily overdue check...');
      const now = new Date();

      // === 1. Помечаем новые просрочки (planned + plannedDate < now) ===
      const overdueAssignments = await this.caRepo.find({
        where: {
          status: AssignmentStatus.PLANNED,
          plannedDate: LessThan(now),
        },
        relations: ['employee', 'employee.user', 'course'],
      });

      this.logger.log(
        `Found ${overdueAssignments.length} new overdue assignments`,
      );

      for (const ca of overdueAssignments) {
        if (!ca.course) {
          this.logger.warn(`Assignment ${ca.id} has no course, skipping`);
          continue;
        }

        ca.status = AssignmentStatus.OVERDUE;
        await this.caRepo.save(ca);

        // Уведомление в ЛК
        const plannedDate = new Date(ca.plannedDate);
        const notification = this.notifRepo.create({
          employeeId: ca.employeeId,
          message: `Курс "${ca.course.name}" просрочен. Плановая дата: ${plannedDate.toLocaleDateString('ru-RU')}`,
          isRead: false,
          courseAssignmentId: ca.id,
        });
        await this.notifRepo.save(notification);

        // Email
        if (ca.employee?.user?.email) {
          await this.mailService.sendOverdueNotification(
            ca.employee.user.email,
            ca.employee.fullName,
            ca.course.name,
            new Date(ca.plannedDate),
          );
        }
      }

      // === 2. БЛОКИРОВКА: сотрудники с просрочкой > 3 дней ===
      const employeesToCheck = await this.empRepo.find({
        where: { isBlocked: false },
        relations: ['user'],
      });

      for (const employee of employeesToCheck) {
        // Находим все просроченные назначения этого сотрудника
        const overdueAssignments = await this.caRepo.find({
          where: {
            employeeId: employee.id,
            status: AssignmentStatus.OVERDUE,
          },
        });

        // Проверяем: есть ли назначение, просроченное более чем на 3 дня
        const hasCriticalOverdue = overdueAssignments.some((ca) => {
          const plannedDate = new Date(ca.plannedDate);
          const diffMs = now.getTime() - plannedDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          return diffDays > 3;
        });

        if (hasCriticalOverdue && !employee.isBlocked) {
          employee.isBlocked = true;
          await this.empRepo.save(employee);

          const criticalCount = overdueAssignments.filter((ca) => {
            const plannedDate = new Date(ca.plannedDate);
            const diffMs = now.getTime() - plannedDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return diffDays > 3;
          }).length;

          const blockNotification = this.notifRepo.create({
            employeeId: employee.id,
            message: `Ваш аккаунт заблокирован из-за ${criticalCount} критических просрочек (более 3 дней). Обратитесь к HR.`,
            isRead: false,
          });
          await this.notifRepo.save(blockNotification);

          if (employee.user?.email) {
            await this.mailService.sendBlockNotification(
              employee.user.email,
              employee.fullName,
              criticalCount,
            );
          }

          this.logger.warn(
            `Employee ${employee.id} blocked due to critical overdue (>3 days)`,
          );
          blockedCount++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Overdue check completed in ${duration}ms. New overdue: ${overdueAssignments.length}, Blocked: ${blockedCount}`,
      );
      res = {
        updated: overdueAssignments.length,
        blocked: blockedCount,
        duration: `${duration}ms`,
      };
    } catch (error) {
      this.logger.error('Overdue check failed', error);
    } finally {
      this.isRunning = false;
    }
    return res;
  }

  async runManualCheck() {
    return this.handleOverdueCheck();
  }

  /**
   * Напоминания за 30, 14, 7, 1 день до истечения срока
   * Запускается каждый день в 9:00 утра
   */
  @Cron('0 9 * * *', {
    name: 'send-reminders',
    timeZone: 'Europe/Moscow',
  })
  async handleReminders() {
    if (this.isRunning) {
      this.logger.warn('Previous task still running, skipping reminders');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting daily reminders...');
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Сбрасываем время для чистого сравнения дат

      // Окна напоминаний в днях
      const reminderWindows = [30, 14, 7, 1];

      for (const daysBefore of reminderWindows) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysBefore);

        // Находим назначения с plannedDate = targetDate
        const assignments = await this.caRepo.find({
          where: {
            status: AssignmentStatus.PLANNED,
            plannedDate: targetDate,
          },
          relations: ['employee', 'employee.user', 'course'],
        });

        this.logger.log(
          `Reminder window ${daysBefore} days: found ${assignments.length} assignments`,
        );

        for (const ca of assignments) {
          if (!ca.course || !ca.employee) continue;

          // Проверяем, не отправляли ли уже напоминание за этот период
          const existingNotification = await this.notifRepo.findOne({
            where: {
              employeeId: ca.employeeId,
              courseAssignmentId: ca.id,
              message: Like(`%${daysBefore} дн%`), // Проверяем по тексту
            },
          });

          if (existingNotification) {
            this.logger.log(
              `Reminder already sent for assignment ${ca.id}, ${daysBefore} days`,
            );
            continue;
          }

          // Уведомление в ЛК
          const notification = this.notifRepo.create({
            employeeId: ca.employeeId,
            message: `⏰ Напоминание: курс "${ca.course.name}" нужно пройти через ${daysBefore} ${this.declineDays(daysBefore)}. Плановая дата: ${targetDate.toLocaleDateString('ru-RU')}`,
            isRead: false,
            courseAssignmentId: ca.id,
          });
          await this.notifRepo.save(notification);

          // Email
          if (ca.employee.user?.email) {
            await this.mailService.sendReminderNotification(
              ca.employee.user.email,
              ca.employee.fullName,
              ca.course.name,
              targetDate,
              daysBefore,
            );
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(`Reminders completed in ${duration}ms`);
    } catch (error) {
      this.logger.error('Reminders failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  private declineDays(n: number): string {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
    if (lastOne === 1) return 'день';
    if (lastOne >= 2 && lastOne <= 4) return 'дня';
    return 'дней';
  }

  // Backup Handling
  @Cron('0 2 * * *', {
    name: 'database-backup',
    timeZone: 'Europe/Moscow',
  })
  async handleBackup() {
    this.logger.log('Starting database backup...');
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    try {
      const { stdout, stderr } = await execPromise('bash ./scripts/backup.sh');
      this.logger.log('Backup output:', stdout);
      if (stderr) this.logger.warn('Backup stderr:', stderr);
    } catch (error) {
      this.logger.error('Backup failed', error);
    }
  }
}
