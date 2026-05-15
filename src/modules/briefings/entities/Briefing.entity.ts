/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/Employee.entity';

export enum BriefingType {
  INITIAL = 'initial',
  REPEATED = 'repeated',
  UNPLANNED = 'unplanned',
  TARGETED = 'targeted',
}

@Entity('briefings')
export class Briefing {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: BriefingType })
  type!: BriefingType;

  @Column({ type: 'date' })
  date!: Date;

  @ManyToOne(() => Employee, (e) => e.briefings)
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column({ type: 'int' })
  employeeId!: number;

  @ManyToOne(() => Employee, (e) => e.conductedBriefings, { nullable: true })
  @JoinColumn({ name: 'instructorId' })
  instructor!: Employee;

  @Column({ type: 'int', nullable: true })
  instructorId!: number;
}
