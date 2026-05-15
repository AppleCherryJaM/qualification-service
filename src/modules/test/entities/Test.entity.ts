/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '../../course/entities/Course.entity';
import { Question } from '../../question/entities/Question.entity';
import { TestResult } from '../../test-result/entities/TestResult.entity';

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @ManyToOne(() => Course, (c) => c.tests)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'int' })
  courseId!: number;

  @OneToMany(() => TestResult, (tr) => tr.test)
  testResults!: TestResult[];

  @OneToMany(() => Question, (q) => q.test)
  questions!: Question[];
}
