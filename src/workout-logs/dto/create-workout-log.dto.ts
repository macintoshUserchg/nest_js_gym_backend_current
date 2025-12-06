import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkoutLogDto {
  @ApiProperty({
    description: 'Member ID for whom the workout log is being created',
    example: 123,
  })
  @IsNumber()
  memberId: number;

  @ApiPropertyOptional({
    description: 'Trainer ID (optional)',
    example: 456,
  })
  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @ApiProperty({
    description: 'Name of the exercise',
    example: 'Bench Press',
  })
  @IsString()
  exercise_name: string;

  @ApiPropertyOptional({
    description: 'Number of sets',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  sets?: number;

  @ApiPropertyOptional({
    description: 'Number of repetitions per set',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  reps?: number;

  @ApiPropertyOptional({
    description: 'Weight used (in kg)',
    example: 40,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Duration of workout (in minutes)',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the workout',
    example: 'Good form, completed all sets',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Date of the workout',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;
}
