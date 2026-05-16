/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/Employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async findAll(filters?: {
    departmentId?: number;
    positionId?: number;
  }): Promise<Employee[]> {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'd')
      .leftJoinAndSelect('e.position', 'p')
      .leftJoinAndSelect('e.user', 'u');

    if (filters?.departmentId) {
      qb.andWhere('e.departmentId = :dept', { dept: filters.departmentId });
    }
    if (filters?.positionId) {
      qb.andWhere('e.positionId = :pos', { pos: filters.positionId });
    }

    return qb.orderBy('e.fullName', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Employee> {
    const emp = await this.repo.findOne({
      where: { id },
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
    if (!emp) throw new NotFoundException(`Employee with ID ${id} not found`);
    return emp;
  }

  async create(data: Partial<Employee>): Promise<Employee> {
    const emp = this.repo.create(data);
    return this.repo.save(emp);
  }

  async update(id: number, data: Partial<Employee>): Promise<Employee> {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  async checkWorkAllowance(id: number) {
    const emp = await this.findOne(id);
    const now = new Date();

    const overdueAssignments = emp.courseAssignments?.filter((ca) => {
      if (!ca.factDate || ca.status === 'overdue') return true;
      const nextDate = new Date(ca.factDate);
      nextDate.setMonth(nextDate.getMonth() + (ca.course?.periodMonths || 0));
      return nextDate < now;
    });

    return {
      allowed: !overdueAssignments?.length,
      overdueCount: overdueAssignments?.length || 0,
      overdueAssignments: overdueAssignments?.map((ca) => ({
        courseName: ca.course?.name,
        plannedDate: ca.plannedDate,
        factDate: ca.factDate,
      })),
    };
  }
}
