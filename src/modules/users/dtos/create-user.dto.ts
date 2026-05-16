import { IsEmail, MinLength, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'User password',
    required: true,
  })
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Employee ID (required for non-admin users)',
  })
  @IsOptional()
  @IsInt()
  employeeId?: number;
}
