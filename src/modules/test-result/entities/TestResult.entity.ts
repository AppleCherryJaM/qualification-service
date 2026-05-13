import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from './Employee';
import { Test } from './Test';

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  takenAt: Date;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'boolean' })
  passed: boolean;

  @ManyToOne(() => Employee, (e) => e.testResults)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'int' })
  employeeId: number;

  @ManyToOne(() => Test, (t) => t.testResults)
  @JoinColumn({ name: 'testId' })
  test: Test;

  @Column({ type: 'int' })
  testId: number;
}
