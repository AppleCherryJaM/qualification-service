import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/User.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'varchar' })
  entity!: string;

  @Column({ type: 'int', nullable: true })
  entityId!: number;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.auditLogs, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', nullable: true })
  userId!: number;
}
