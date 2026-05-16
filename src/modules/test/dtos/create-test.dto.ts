import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class CreateTestDto {
  @ApiProperty({ example: 'Охрана труда - базовый' })
  @IsString()
  title!: string;

  @IsInt()
  courseId!: number;

  @ApiPropertyOptional({
    example: 70,
    description: 'Проходной балл (0-100). По умолчанию: 70',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiProperty({ type: () => [CreateQuestionDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}
