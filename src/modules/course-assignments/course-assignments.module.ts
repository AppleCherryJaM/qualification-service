import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAssignmentsService } from './course-assignments.service';
import { CourseAssignmentsController } from './course-assignments.controller';
import { CourseAssignment } from './entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Course } from '../course/entities/Course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseAssignment, Employee, Course])],
  providers: [CourseAssignmentsService],
  controllers: [CourseAssignmentsController],
  exports: [CourseAssignmentsService],
})
export class CourseAssignmentsModule {}
