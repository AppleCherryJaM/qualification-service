import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { BriefingsModule } from './modules/briefings/briefings.module';
import { CoursesModule } from './modules/course/course.module';
import { CourseAssignmentsModule } from './modules/course-assignments/course-assignments.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { TestResultModule } from './modules/test-result/test-result.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrainingTypesModule } from './modules/training-types/training-types.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { InternshipsModule } from './modules/internships/internship.module';
import { NotificationsModule } from './modules/notifications/notification.module';
import { TestsModule } from './modules/test/test.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        migrations: ['dist/migrations/*{.ts,.js}'],
        ssl: false,
        migrationsRun: true,
        logging: false,
      }),
    }),

    UsersModule,
    EmployeesModule,
    AuditLogsModule,
    BriefingsModule,
    CoursesModule,
    CourseAssignmentsModule,
    DepartmentModule,
    InternshipsModule,
    NotificationsModule,
    PositionModule,
    TestsModule,
    TestResultModule,
    AuthModule,
    TrainingTypesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
