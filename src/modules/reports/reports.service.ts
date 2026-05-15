/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Briefing } from '../briefings/entities/Briefing.entity';
import {
  AssignmentStatus,
  CourseAssignment,
} from '../course-assignments/entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { TestResult } from '../test-result/entities/TestResult.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(CourseAssignment)
    private caRepo: Repository<CourseAssignment>,
    @InjectRepository(Briefing) private briefRepo: Repository<Briefing>,
    @InjectRepository(TestResult) private resultRepo: Repository<TestResult>,
  ) {}

  async employeeCard(employeeId: number): Promise<Employee | null> {
    return this.empRepo.findOne({
      where: { id: employeeId },
      relations: [
        'department',
        'position',
        'courseAssignments',
        'courseAssignments.course',
        'briefings',
        'internships',
        'testResults',
        'testResults.test',
      ],
    });
  }

  async debtors(): Promise<CourseAssignment[]> {
    return this.caRepo.find({
      where: { status: AssignmentStatus.OVERDUE },
      relations: ['employee', 'employee.department', 'course'],
    });
  }

  async byDepartment(departmentId: number) {
    const employees = await this.empRepo.find({
      where: { departmentId },
      relations: [
        'position',
        'courseAssignments',
        'courseAssignments.course',
        'briefings',
      ],
    });

    return employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      tabNumber: e.tabNumber,
      position: e.position?.name,
      courseCount: e.courseAssignments?.length || 0,
      completedCount:
        e.courseAssignments?.filter(
          (c) => c.status === AssignmentStatus.COMPLETED,
        ).length || 0,
      overdueCount:
        e.courseAssignments?.filter(
          (c) => c.status === AssignmentStatus.OVERDUE,
        ).length || 0,
      briefingCount: e.briefings?.length || 0,
    }));
  }

  async briefingJournal(startDate: Date, endDate: Date): Promise<Briefing[]> {
    return this.briefRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.employee', 'e')
      .leftJoinAndSelect('b.instructor', 'i')
      .where('b.date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .orderBy('b.date', 'DESC')
      .getMany();
  }

  async regulatoryReport(): Promise<CourseAssignment[]> {
    const now = new Date();
    const assignments = await this.caRepo.find({
      where: {
        status: AssignmentStatus.COMPLETED,
        passed: true,
      },
      relations: [
        'employee',
        'employee.department',
        'course',
        'course.trainingType',
      ],
    });

    return assignments.filter((ca) => {
      if (!ca.factDate || !ca.course?.periodMonths) return false;
      const nextDate = new Date(ca.factDate);
      nextDate.setMonth(nextDate.getMonth() + ca.course.periodMonths);
      return nextDate >= now;
    });
  }
}
