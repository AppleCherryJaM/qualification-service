/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../modules/employees/entities/Employee.entity';

@Injectable()
export class DepartmentGuard implements CanActivate {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    if (user.roles?.includes('admin') || user.roles?.includes('hr')) {
      return true;
    }

    if (!user.roles?.includes('manager')) {
      return true;
    }

    const manager = await this.employeeRepo.findOne({
      where: { id: user.employeeId },
    });

    if (!manager || !manager.departmentId) {
      throw new ForbiddenException('Manager profile incomplete');
    }

    const employeeId = parseInt(params.id, 10);
    if (!isNaN(employeeId)) {
      const target = await this.employeeRepo.findOne({
        where: { id: employeeId },
      });
      if (!target || target.departmentId !== manager.departmentId) {
        throw new ForbiddenException(
          'You can only access employees from your department',
        );
      }
    }

    const deptId = parseInt(params.departmentId || params.id, 10);
    if (!isNaN(deptId) && request.path?.includes('by-department')) {
      if (deptId !== manager.departmentId) {
        throw new ForbiddenException('You can only access your own department');
      }
    }

    return true;
  }
}
