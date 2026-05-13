import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Department } from './Department';
import { Position } from './Position';
import { User } from './User';
import { CourseAssignment } from './CourseAssignment';
import { Briefing } from './Briefing';
import { Internship } from './Internship';
import { TestResult } from './TestResult';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tabNumber: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'date' })
  hireDate: Date;

  @ManyToOne(() => Department, (d) => d.employees, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'int', nullable: true })
  departmentId: number;

  @ManyToOne(() => Position, (p) => p.employees, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  position: Position;

  @Column({ type: 'int', nullable: true })
  positionId: number;

  @OneToOne(() => User, (u) => u.employee)
  user: User;

  @OneToMany(() => CourseAssignment, (ca) => ca.employee)
  courseAssignments: CourseAssignment[];

  @OneToMany(() => Briefing, (b) => b.employee)
  briefings: Briefing[];

  @OneToMany(() => Internship, (i) => i.employee)
  internships: Internship[];

  @OneToMany(() => TestResult, (tr) => tr.employee)
  testResults: TestResult[];

  @OneToMany(() => Briefing, (b) => b.instructor)
  conductedBriefings: Briefing[];

  @OneToMany(() => Internship, (i) => i.mentor)
  mentoredInternships: Internship[];
}
