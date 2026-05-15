/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CourseAssignment } from '../../course-assignments/entities/CourseAssignment.entity';
import { TrainingType } from '../../training-types/entities/TrainingType.entity';
import { Test } from '../../test/entities/Test.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'int' })
  periodMonths!: number;

  @ManyToOne(() => TrainingType, (tt) => tt.courses)
  @JoinColumn({ name: 'trainingTypeId' })
  trainingType!: TrainingType;

  @Column({ type: 'int' })
  trainingTypeId!: number;

  @OneToMany(() => CourseAssignment, (ca) => ca.course)
  courseAssignments?: CourseAssignment[];

  @OneToMany(() => Test, (t) => t.course)
  tests?: Test[];
}
