import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
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

        const plannedDate = new Date(ca.plannedDate);
        const notification = this.notifRepo.create({
          employeeId: ca.employeeId,
          message: `Курс "${ca.course.name}" просрочен. Плановая дата: ${plannedDate.toLocaleDateString('ru-RU')}`,
          isRead: false,
          courseAssignmentId: ca.id,
        });
        await this.notifRepo.save(notification);

        if (ca.employee?.user?.email) {
          await this.mailService.sendOverdueNotification(
            ca.employee.user.email,
            ca.employee.fullName,
            ca.course.name,
            new Date(ca.plannedDate),
          );
        }
      }

      const employeesToCheck = await this.empRepo.find({
        where: { isBlocked: false },
        relations: ['user'],
      });

      for (const employee of employeesToCheck) {
        const overdueCount = await this.caRepo.count({
          where: {
            employeeId: employee.id,
            status: AssignmentStatus.OVERDUE,
          },
        });

        this.logger.log(
          `Employee ${employee.id} (${employee.fullName}): ${overdueCount} overdue assignments`,
        );

        if (overdueCount >= 3 && !employee.isBlocked) {
          employee.isBlocked = true;
          await this.empRepo.save(employee);

          const blockNotification = this.notifRepo.create({
            employeeId: employee.id,
            message: `Ваш аккаунт заблокирован из-за ${overdueCount} просроченных назначений. Обратитесь к HR.`,
            isRead: false,
          });
          await this.notifRepo.save(blockNotification);

          if (employee.user?.email) {
            await this.mailService.sendBlockNotification(
              employee.user.email,
              employee.fullName,
              overdueCount,
            );
          }

          this.logger.warn(
            `Employee ${employee.id} blocked due to ${overdueCount} overdue assignments`,
          );

          blockedCount++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Overdue check completed in ${duration}ms. New overdue: ${overdueAssignments.length}`,
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
}
