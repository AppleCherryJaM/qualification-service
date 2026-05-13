import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TrainingType } from './TrainingType';
import { CourseAssignment } from './CourseAssignment';
import { Test } from './Test';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  periodMonths: number;

  @ManyToOne(() => TrainingType, (tt) => tt.courses)
  @JoinColumn({ name: 'trainingTypeId' })
  trainingType: TrainingType;

  @Column({ type: 'int' })
  trainingTypeId: number;

  @OneToMany(() => CourseAssignment, (ca) => ca.course)
  courseAssignments: CourseAssignment[];

  @OneToMany(() => Test, (t) => t.course)
  tests: Test[];
}
