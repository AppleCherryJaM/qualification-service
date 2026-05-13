import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Test } from './Test';
import { Answer } from './Answer';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Test, (t) => t.questions)
  @JoinColumn({ name: 'testId' })
  test: Test;

  @Column({ type: 'int' })
  testId: number;

  @OneToMany(() => Answer, (a) => a.question)
  answers: Answer[];
}
