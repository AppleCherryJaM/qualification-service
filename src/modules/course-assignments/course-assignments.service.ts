import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  CourseAssignment,
  AssignmentStatus,
} from './entities/CourseAssignment.entity';
import { Course } from '../course/entities/Course.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CourseAssignmentsService {
  constructor(
    @InjectRepository(CourseAssignment)
    private readonly repo: Repository<CourseAssignment>,
    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly mailService: MailService,
  ) {}

  async findAll(filters?: {
    employeeId?: number;
    status?: string;
    overdue?: boolean;
  }) {
    const qb = this.repo
      .createQueryBuilder('ca')
      .leftJoinAndSelect('ca.employee', 'e')
      .leftJoinAndSelect('ca.course', 'c');

    if (filters?.employeeId)
      qb.andWhere('ca.employeeId = :emp', { emp: filters.employeeId });
    if (filters?.status) qb.andWhere('ca.status = :st', { st: filters.status });
    if (filters?.overdue) {
      qb.andWhere('ca.status = :overdue', {
        overdue: AssignmentStatus.OVERDUE,
      });
    }

    return qb.orderBy('ca.plannedDate', 'ASC').getMany();
  }

  async findOne(id: number): Promise<CourseAssignment> {
    const ca = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'employee.department', 'course', 'notifications'],
    });
    if (!ca) throw new NotFoundException('Assignment not found');
    return ca;
  }

  async create(data: Partial<CourseAssignment>): Promise<CourseAssignment> {
    const ca = this.repo.create(data);
    return this.repo.save(ca);
  }

  async assign(
    employeeId: number,
    courseId: number,
    plannedDate: Date,
  ): Promise<CourseAssignment> {
    const employee = await this.empRepo.findOne({
      where: { id: employeeId },
      relations: ['user'],
    });
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!employee || !course)
      throw new NotFoundException('Employee or course not found');

    const ca = this.repo.create({
      employeeId,
      courseId,
      plannedDate,
      status: AssignmentStatus.PLANNED,
    });
    const saved = await this.repo.save(ca);

    // Отправляем email-уведомление при назначении
    if (employee?.user?.email) {
      await this.mailService.sendCourseAssignedNotification(
        employee.user.email,
        employee.fullName,
        course.name,
        plannedDate,
      );
    }

    return saved;
  }

  async complete(
    id: number,
    factDate: Date,
    passed: boolean,
    filePath?: string,
  ): Promise<CourseAssignment> {
    const ca = await this.findOne(id);
    ca.factDate = factDate;
    ca.passed = passed;
    ca.filePath = filePath || ca.filePath;
    ca.status = passed ? AssignmentStatus.COMPLETED : AssignmentStatus.OVERDUE;
    return this.repo.save(ca);
  }

  async update(
    id: number,
    data: Partial<CourseAssignment>,
  ): Promise<CourseAssignment> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async checkOverdue() {
    const now = new Date();
    const overdue = await this.repo.find({
      where: {
        status: AssignmentStatus.PLANNED,
        plannedDate: LessThan(now),
      },
      relations: ['employee', 'course'],
    });

    for (const ca of overdue) {
      ca.status = AssignmentStatus.OVERDUE;
      await this.repo.save(ca);
    }

    return { updated: overdue.length };
  }

  getNextDate(ca: CourseAssignment): Date | null {
    if (!ca.factDate || !ca.course?.periodMonths) return null;
    const d = new Date(ca.factDate);
    d.setMonth(d.getMonth() + ca.course.periodMonths);
    return d;
  }
}
