import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/Employee.entity';

export enum PositionCategory {
  WORKER = 'worker',
  SPECIALIST = 'specialist',
  MANAGER = 'manager',
}

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name?: string;

  @Column({ type: 'enum', enum: PositionCategory })
  category!: PositionCategory;

  @OneToMany(() => Employee, (e) => e.position)
  employees!: Employee[];
}
