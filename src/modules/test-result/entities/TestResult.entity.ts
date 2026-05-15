/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/Employee.entity';
import { Test } from '../../test/entities/Test.entity';

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  takenAt!: Date;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'boolean' })
  passed!: boolean;

  @ManyToOne(() => Employee, (e) => e.testResults)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @ManyToOne(() => Test, (t) => t.testResults)
  @JoinColumn({ name: 'testId' })
  test!: Test;

  @Column({ type: 'int' })
  testId!: number;
}
