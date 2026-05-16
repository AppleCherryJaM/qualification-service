import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../answer/entities/Answer.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Question } from '../question/entities/Question.entity';
import { TestResult } from '../test-result/entities/TestResult.entity';
import { TestsService } from './test.service';
import { TestsController } from './test.controller';
import { Test } from './entities/Test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, Question, Answer, TestResult, Employee]),
  ],
  providers: [TestsService],
  controllers: [TestsController],
  exports: [TestsService],
})
export class TestsModule {}
