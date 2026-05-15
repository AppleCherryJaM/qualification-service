/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Employee } from './entities/Employee.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  findAll(
    @Query('departmentId') deptId?: string,
    @Query('positionId') posId?: string,
    @Request() req?: any,
  ) {
    let departmentId = deptId ? parseInt(deptId) : undefined;
    if (
      req.user.roles?.includes('manager') &&
      !req.user.roles?.includes('admin') &&
      !req.user.roles?.includes('hr')
    ) {
      departmentId = req.user.employee?.departmentId;
    }

    return this.service.findAll({
      departmentId,
      positionId: posId ? parseInt(posId) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (
      req.user.roles?.includes('employee') &&
      !req.user.roles?.includes('admin') &&
      !req.user.roles?.includes('hr') &&
      !req.user.roles?.includes('manager')
    ) {
      if (req.user.employeeId !== id) {
        throw new ForbiddenException('You can only view your own record');
      }
    }

    if (
      req.user.roles?.includes('manager') &&
      !req.user.roles?.includes('admin') &&
      !req.user.roles?.includes('hr')
    ) {
      const emp = await this.service.findOne(id);
      if (emp.departmentId !== req.user.employee?.departmentId) {
        throw new ForbiddenException(
          'You can only view employees from your department',
        );
      }
      return emp;
    }

    return this.service.findOne(id);
  }

  @Get(':id/allowance')
  checkAllowance(@Param('id', ParseIntPipe) id: number) {
    return this.service.checkWorkAllowance(id);
  }

  @Post()
  @Roles('admin', 'hr')
  create(@Body() dto: Partial<Employee>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Employee>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
