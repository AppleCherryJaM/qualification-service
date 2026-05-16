import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExcelService } from './excel.service';
import { Briefing } from '../briefings/entities/Briefing.entity';
import { CourseAssignment } from '../course-assignments/entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { TestResult } from '../test-result/entities/TestResult.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      CourseAssignment,
      Briefing,
      TestResult,
    ]),
  ],
  providers: [ReportsService, ExcelService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
