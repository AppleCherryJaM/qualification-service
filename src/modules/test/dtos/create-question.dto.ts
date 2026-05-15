import CreateAnswerDto from './create-answer.dto';

export default interface CreateQuestionDto {
  text: string;
  answers: CreateAnswerDto[];
}
