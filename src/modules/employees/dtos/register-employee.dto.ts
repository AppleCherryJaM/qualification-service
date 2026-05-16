import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsInt,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmployeeDto {
  @ApiProperty({ example: '011', description: 'Employee tab number' })
  @IsNotEmpty()
  tabNumber!: string;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '2024-06-01' })
  @IsDateString()
  hireDate!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  positionId!: number;

  // User fields
  @ApiProperty({ example: 'ivanov@company.ru' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Role ID (default: 2 = employee)',
  })
  @IsOptional()
  @IsInt()
  roleId?: number;
}
