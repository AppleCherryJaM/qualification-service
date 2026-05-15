import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Department } from '../department/entities/Department.entity';
import { Employee } from './entities/Employee.entity';
import { Position } from '../position/entities/Position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Position])],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
