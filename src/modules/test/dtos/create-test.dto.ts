import CreateQuestionDto from './create-question.dto';

export default interface CreateTestDto {
  title: string;
  courseId: number;
  questions: CreateQuestionDto[];
}
