import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAssignment } from '../course-assignments/entities/CourseAssignment.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Notification } from '../notifications/entities/Notification.entity';
import { MailModule } from '../mail/mail.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseAssignment, Employee, Notification]),
    MailModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
