/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AuditLog } from '../../audit-log/entities/AuditLog.entity';
import { Employee } from '../../employees/entities/Employee.entity';
import { UserRole } from './UserRole.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  login!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @OneToOne(() => Employee, (e) => e.user, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee?: Employee;

  @Column({ type: 'int', nullable: true })
  employeeId?: number;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  userRoles?: UserRole[];

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs?: AuditLog[];
}
