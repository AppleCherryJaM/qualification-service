/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../answer/entities/Answer.entity';
import { Employee } from '../employees/entities/Employee.entity';
import { Question } from '../question/entities/Question.entity';
import { TestResult } from '../test-result/entities/TestResult.entity';
import { Test } from './entities/Test.entity';
import CreateTestDto from './dtos/create-test.dto';
import SubmitAnswerDto from './dtos/submit-answer.dto';
import { FindAnswerDto } from './dtos/find-answer.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(Question) private qRepo: Repository<Question>,
    @InjectRepository(Answer) private aRepo: Repository<Answer>,
    @InjectRepository(TestResult) private resultRepo: Repository<TestResult>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
  ) {}

  async findAll(): Promise<Test[]> {
    return this.testRepo.find({
      relations: ['course', 'questions', 'questions.answers'],
    });
  }

  async findOne(id: number): Promise<Test> {
    const test = await this.testRepo.findOne({
      where: { id: id },
      relations: ['course', 'questions', 'questions.answers'],
    });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async create(data: CreateTestDto): Promise<Test> {
    const test = new Test();
    test.title = data.title;
    test.courseId = data.courseId;

    const savedTest = await this.testRepo.save(test);

    for (const q of data.questions) {
      const question = new Question();
      question.text = q.text;
      question.testId = savedTest.id;
      const savedQuestion = await this.qRepo.save(question);

      for (const a of q.answers) {
        const answer = new Answer();
        answer.text = a.text;
        answer.isCorrect = a.isCorrect;
        answer.questionId = savedQuestion.id;
        await this.aRepo.save(answer);
      }
    }

    return this.findOne(savedTest.id);
  }

  async remove(id: number): Promise<void> {
    await this.testRepo.delete(id);
  }

  async submit(
    employeeId: number,
    testId: number,
    answers: SubmitAnswerDto[],
  ): Promise<TestResult> {
    const test = await this.findOne(testId);
    if (!test) throw new NotFoundException('Test not found');

    const employee = await this.empRepo.findOne({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    let correct = 0;
    for (const ans of answers) {
      const whereCondition: FindAnswerDto = {
        id: ans.answerId,
        questionId: ans.questionId,
      };

      const answer = await this.aRepo.findOne({ where: whereCondition });
      if (answer?.isCorrect) correct++;
    }

    const total = test.questions?.length || 1;
    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    const result = new TestResult();
    result.employeeId = employeeId;
    result.testId = testId;
    result.score = score;
    result.passed = passed;

    return this.resultRepo.save(result);
  }

  async findResults(filters?: {
    employeeId?: number;
    testId?: number;
  }): Promise<TestResult[]> {
    const qb = this.resultRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.employee', 'e')
      .leftJoinAndSelect('r.test', 't');

    if (filters?.employeeId)
      qb.andWhere('r.employeeId = :emp', { emp: filters.employeeId });
    if (filters?.testId)
      qb.andWhere('r.testId = :test', { test: filters.testId });

    return qb.orderBy('r.takenAt', 'DESC').getMany();
  }
}
