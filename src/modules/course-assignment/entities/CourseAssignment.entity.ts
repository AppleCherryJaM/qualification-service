import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Employee } from './Employee';
import { Course } from './Course';
import { Notification } from './Notification';

export enum AssignmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

@Entity('course_assignments')
export class CourseAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  plannedDate: Date;

  @Column({ type: 'date', nullable: true })
  factDate: Date;

  @Column({ type: 'boolean', nullable: true })
  passed: boolean;

  @Column({ type: 'varchar', nullable: true })
  filePath: string;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.PLANNED })
  status: AssignmentStatus;

  @ManyToOne(() => Employee, (e) => e.courseAssignments)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'int' })
  employeeId: number;

  @ManyToOne(() => Course, (c) => c.courseAssignments)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'int' })
  courseId: number;

  @OneToMany(() => Notification, (n) => n.courseAssignment)
  notifications: Notification[];
}
