import { IsInt } from 'class-validator';

export class FindAnswerDto {
  @IsInt()
  id!: number;

  @IsInt()
  questionId!: number;
}
