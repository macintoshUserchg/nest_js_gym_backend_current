import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const EQUIPMENT_OPTIONS = [
  'BARBELL',
  'DUMBBELL',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'KETTLEBELL',
  'MEDICINE_BALL',
  'RESISTANCE_BAND',
  'OTHER',
];

const CHART_TYPE_OPTIONS = [
  'STRENGTH',
  'CARDIO',
  'HIIT',
  'FLEXIBILITY',
  'COMPOUND',
];

const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const PLAN_TYPE_OPTIONS = [
  'strength',
  'cardio',
  'flexibility',
  'endurance',
  'general',
];

export class CreateWorkoutTemplateExerciseDto {
  @ApiProperty({ example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  exercise_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['sets_reps', 'time', 'distance'] })
  @IsEnum(['sets_reps', 'time', 'distance'])
  exercise_type: string;

  @ApiPropertyOptional({ enum: EQUIPMENT_OPTIONS })
  @IsOptional()
  @IsEnum(EQUIPMENT_OPTIONS)
  equipment_required?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  weight_kg?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  distance_km?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  day_of_week: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  order_index?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alternatives?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  member_can_skip?: boolean;
}

export class CreateWorkoutTemplateDto {
  @ApiProperty({ example: 'Full Body Strength Template' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['PRIVATE', 'GYM_PUBLIC'], default: 'PRIVATE' })
  @IsEnum(['PRIVATE', 'GYM_PUBLIC'])
  visibility: string;

  @ApiProperty({ enum: CHART_TYPE_OPTIONS })
  @IsEnum(CHART_TYPE_OPTIONS)
  chart_type: string;

  @ApiProperty({ enum: DIFFICULTY_OPTIONS })
  @IsEnum(DIFFICULTY_OPTIONS)
  difficulty_level: string;

  @ApiProperty({ enum: PLAN_TYPE_OPTIONS })
  @IsEnum(PLAN_TYPE_OPTIONS)
  plan_type: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  duration_days: number;

  @ApiPropertyOptional({ description: 'Share with entire gym', default: false })
  @IsOptional()
  @IsBoolean()
  is_shared_gym?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ type: [CreateWorkoutTemplateExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutTemplateExerciseDto)
  exercises: CreateWorkoutTemplateExerciseDto[];
}

export class UpdateWorkoutTemplateDto {
  @ApiPropertyOptional({ example: 'Updated Full Body Template' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['PRIVATE', 'GYM_PUBLIC'] })
  @IsOptional()
  @IsEnum(['PRIVATE', 'GYM_PUBLIC'])
  visibility?: string;

  @ApiPropertyOptional({ enum: CHART_TYPE_OPTIONS })
  @IsOptional()
  @IsEnum(CHART_TYPE_OPTIONS)
  chart_type?: string;

  @ApiPropertyOptional({ enum: DIFFICULTY_OPTIONS })
  @IsOptional()
  @IsEnum(DIFFICULTY_OPTIONS)
  difficulty_level?: string;

  @ApiPropertyOptional({ enum: PLAN_TYPE_OPTIONS })
  @IsOptional()
  @IsEnum(PLAN_TYPE_OPTIONS)
  plan_type?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration_days?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_shared_gym?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}

export class CopyWorkoutTemplateDto {
  @ApiProperty({ example: 'My Copied Template' })
  @IsString()
  @IsNotEmpty()
  new_title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  new_description?: string;
}

export class RateWorkoutTemplateDto {
  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  rating: number;
}

export class SubstituteExerciseDto {
  @ApiProperty({ description: 'Original exercise name' })
  @IsString()
  @IsNotEmpty()
  original_exercise: string;

  @ApiProperty({ description: 'Substituted exercise name' })
  @IsString()
  @IsNotEmpty()
  substituted_exercise: string;

  @ApiPropertyOptional({ description: 'Reason for substitution' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AssignWorkoutTemplateDto {
  @ApiProperty({ description: 'Member ID' })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiPropertyOptional({ description: 'Assignment ID' })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Customizations for the member' })
  @IsOptional()
  skipped_exercises?: string[];
}

export class FilterTemplatesDto {
  @ApiPropertyOptional({ enum: DIFFICULTY_OPTIONS })
  @IsOptional()
  @IsEnum(DIFFICULTY_OPTIONS)
  difficulty_level?: string;

  @ApiPropertyOptional({ enum: PLAN_TYPE_OPTIONS })
  @IsOptional()
  @IsEnum(PLAN_TYPE_OPTIONS)
  plan_type?: string;

  @ApiPropertyOptional({ enum: CHART_TYPE_OPTIONS })
  @IsOptional()
  @IsEnum(CHART_TYPE_OPTIONS)
  chart_type?: string;

  @ApiPropertyOptional({ enum: ['PRIVATE', 'GYM_PUBLIC'] })
  @IsOptional()
  @IsEnum(['PRIVATE', 'GYM_PUBLIC'])
  visibility?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Filter by trainer ID' })
  @IsOptional()
  @IsInt()
  trainerId?: number;

  @ApiPropertyOptional({ description: 'Only show shared templates' })
  @IsOptional()
  @IsBoolean()
  shared_only?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
