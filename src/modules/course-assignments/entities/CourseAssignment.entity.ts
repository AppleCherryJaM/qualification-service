/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/Employee.entity';
import { Course } from '../../course/entities/Course.entity';
import { Notification } from '../../notifications/entities/Notification.entity';

export enum AssignmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

@Entity('course_assignments')
export class CourseAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  plannedDate!: Date;

  @Column({ type: 'date', nullable: true })
  factDate!: Date;

  @Column({ type: 'boolean', nullable: true })
  passed!: boolean;

  @Column({ type: 'varchar', nullable: true })
  filePath?: string;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PLANNED,
  })
  status?: AssignmentStatus;

  @ManyToOne(() => Employee, (e) => e.courseAssignments)
  @JoinColumn({ name: 'employeeId' })
  employee?: Employee;

  @Column({ type: 'int' })
  employeeId?: number;

  @ManyToOne(() => Course, (c) => c.courseAssignments)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ type: 'int' })
  courseId?: number;

  @OneToMany(() => Notification, (n) => n.courseAssignment)
  notifications?: Notification[];
}
