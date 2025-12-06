import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateWorkoutLogDto {
  @IsNumber()
  memberId: number;

  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @IsString()
  exercise_name: string;

  @IsOptional()
  @IsInt()
  sets?: number;

  @IsOptional()
  @IsInt()
  reps?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  date: string;
}
