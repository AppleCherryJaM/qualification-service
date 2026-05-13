import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from './Employee';
import { CourseAssignment } from './CourseAssignment';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Employee, (e) => e.notifications)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'int' })
  employeeId: number;

  @ManyToOne(() => CourseAssignment, (ca) => ca.notifications, { nullable: true })
  @JoinColumn({ name: 'courseAssignmentId' })
  courseAssignment: CourseAssignment;

  @Column({ type: 'int', nullable: true })
  courseAssignmentId: number;
}
