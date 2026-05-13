import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './Course';
import { TestResult } from './TestResult';
import { Question } from './Question';

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @ManyToOne(() => Course, (c) => c.tests)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'int' })
  courseId: number;

  @OneToMany(() => TestResult, (tr) => tr.test)
  testResults: TestResult[];

  @OneToMany(() => Question, (q) => q.test)
  questions: Question[];
}
