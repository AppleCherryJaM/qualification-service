/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Briefing } from '../../briefings/entities/Briefing.entity';
import { CourseAssignment } from '../../course-assignments/entities/CourseAssignment.entity';
import { Department } from '../../department/entities/Department.entity';
import { Internship } from '../../internships/entities/Internship.entity';
import { TestResult } from '../../test-result/entities/TestResult.entity';
import { User } from '../../users/entities/User.entity';
import { Position } from '../../position/entities/Position.entity';
import { Notification } from '../../notifications/entities/Notification.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  tabNumber!: string;

  @Column({ type: 'varchar' })
  fullName!: string;

  @Column({ type: 'date' })
  hireDate!: Date;

  @ManyToOne(() => Department, (d) => d.employees, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @Column({ type: 'int', nullable: true })
  departmentId?: number;

  @ManyToOne(() => Position, (p) => p.employees, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  position?: Position;

  @Column({ type: 'int', nullable: true })
  positionId?: number;

  @Column({ type: 'boolean', default: false })
  isBlocked!: boolean;

  @OneToOne(() => User, (u) => u.employee)
  user!: User;

  @OneToMany(() => CourseAssignment, (ca) => ca.employee)
  courseAssignments?: CourseAssignment[];

  @OneToMany(() => Briefing, (b) => b.employee)
  briefings?: Briefing[];

  @OneToMany(() => Internship, (i) => i.employee)
  internships?: Internship[];

  @OneToMany(() => TestResult, (tr) => tr.employee)
  testResults?: TestResult[];

  @OneToMany(() => Briefing, (b) => b.instructor)
  conductedBriefings?: Briefing[];

  @OneToMany(() => Internship, (i) => i.mentor)
  mentoredInternships?: Internship[];

  @OneToMany(() => Notification, (n) => n.employee)
  notifications?: Notification[];
}
