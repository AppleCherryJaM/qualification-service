import { IsInt } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  questionId!: number;

  @IsInt()
  answerId!: number;
}
