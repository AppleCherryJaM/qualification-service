import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from '../../course/entities/Course.entity';

@Entity('training_types')
export class TrainingType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @OneToMany(() => Course, (c) => c.trainingType)
  courses!: Course[];
}
