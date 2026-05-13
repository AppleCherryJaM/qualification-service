import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './Employee';

@Entity('internships')
export class Internship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  shiftsCount: number;

  @Column({ type: 'boolean', nullable: true })
  passed: boolean;

  @ManyToOne(() => Employee, (e) => e.internships)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'int' })
  employeeId: number;

  @ManyToOne(() => Employee, (e) => e.mentoredInternships, { nullable: true })
  @JoinColumn({ name: 'mentorId' })
  mentor: Employee;

  @Column({ type: 'int', nullable: true })
  mentorId: number;
}
