import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAssignmentsService } from './course-assignments.service';
import { CourseAssignmentsController } from './course-assignments.controller';
import { CourseAssignment } from './entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Course } from '../course/entities/Course.entity';
import { MailModule } from '../mail/mail.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseAssignment, Employee, Course]),
    MailModule,
    TasksModule,
  ],
  providers: [CourseAssignmentsService],
  controllers: [CourseAssignmentsController],
  exports: [CourseAssignmentsService],
})
export class CourseAssignmentsModule {}
