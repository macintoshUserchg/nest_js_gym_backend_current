import { MaxLength, IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkoutPlanExerciseDto {
  @ApiProperty({ description: 'Exercise name', example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  exercise_name: string;

  @ApiPropertyOptional({ description: 'Exercise description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Exercise type',
    enum: ['sets_reps', 'time', 'distance'],
    example: 'sets_reps',
  })
  @IsEnum(['sets_reps', 'time', 'distance'])
  exercise_type: string;

  @ApiPropertyOptional({ description: 'Number of sets', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @ApiPropertyOptional({ description: 'Number of reps', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_kg?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number;

  @ApiPropertyOptional({ description: 'Distance in km', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_km?: number;

  @ApiProperty({
    description: 'Day of week (1=Monday, 7=Sunday)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  day_of_week: number;

  @ApiPropertyOptional({ description: 'Exercise instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @ApiProperty({ description: 'Plan title', example: 'Beginner Strength Plan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level: string;

  @ApiProperty({
    description: 'Plan type',
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'],
    example: 'strength',
  })
  @IsEnum(['strength', 'cardio', 'flexibility', 'endurance', 'general'])
  plan_type: string;

  @ApiProperty({ description: 'Duration in days', example: 30 })
  @IsInt()
  @Min(1)
  duration_days: number;

  @ApiProperty({ description: 'Start date', example: '2024-01-01' })
  @IsDateString()
  start_date: Date;

  @ApiProperty({ description: 'End date', example: '2024-01-31' })
  @IsDateString()
  end_date: Date;

  @ApiPropertyOptional({ description: 'Trainer ID (optional)', example: 1 })
  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @ApiPropertyOptional({ description: 'Branch ID (optional)' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Plan notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Exercises array',
    type: [CreateWorkoutPlanExerciseDto],
  })
  @IsArray()
  @IsNotEmpty()
  exercises: CreateWorkoutPlanExerciseDto[];
}
