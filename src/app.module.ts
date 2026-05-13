import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AnswerModule } from './modules/answer/answer.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { BriefingModule } from './modules/briefing/briefing.module';
import { CourseModule } from './modules/course/course.module';
import { CourseAssignmentModule } from './modules/course-assignment/course-assignment.module';
import { DepartmentModule } from './modules/department/department.module';
import { InternshipModule } from './modules/internship/internship.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PositionModule } from './modules/position/position.module';
import { QuestionModule } from './modules/question/question.module';
import { TestModule } from './modules/test/test.module';
import { TestResultModule } from './modules/test-result/test-result.module';

@Module({
  imports: [UsersModule, EmployeesModule, AnswerModule, AuditLogModule, BriefingModule, CourseModule, CourseAssignmentModule, DepartmentModule, InternshipModule, NotificationModule, PositionModule, QuestionModule, TestModule, TestResultModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
