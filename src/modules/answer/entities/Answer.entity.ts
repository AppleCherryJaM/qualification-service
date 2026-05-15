/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../question/entities/Question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  i!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'boolean' })
  isCorrect!: boolean;

  @ManyToOne(() => Question, (q) => q.answers)
  @JoinColumn({ name: 'questionId' })
  question!: Question;

  @Column({ type: 'int' })
  questionId!: number;
}
