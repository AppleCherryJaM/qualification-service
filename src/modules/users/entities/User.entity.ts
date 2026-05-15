/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/Employee.entity';
import { UserRole } from './UserRole.entity';
import { AuditLog } from '../../audit-logs/entities/AuditLog.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @OneToOne(() => Employee, (e) => e.user, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee?: Employee;

  @Column({ type: 'int', nullable: true })
  employeeId?: number;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  roles?: UserRole[];

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs?: AuditLog[];
}
