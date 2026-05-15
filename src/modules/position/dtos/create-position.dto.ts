import { IsNotEmpty, IsEnum } from 'class-validator';
import { PositionCategory } from '../entities/Position.entity';

export class CreatePositionDto {
  @IsNotEmpty()
  name!: string;

  @IsEnum(PositionCategory)
  category!: PositionCategory;
}
