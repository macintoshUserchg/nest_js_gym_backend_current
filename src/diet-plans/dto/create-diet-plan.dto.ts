import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDietPlanMealDto {
  @ApiProperty({
    description: 'Meal type',
    enum: [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'pre_workout',
      'post_workout',
    ],
    example: 'breakfast',
  })
  @IsEnum([
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'pre_workout',
    'post_workout',
  ])
  meal_type: string;

  @ApiProperty({ description: 'Meal name', example: 'Oatmeal with Fruits' })
  @IsString()
  @IsNotEmpty()
  meal_name: string;

  @ApiPropertyOptional({ description: 'Meal description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Ingredients list' })
  @IsOptional()
  @IsString()
  ingredients?: string;

  @ApiPropertyOptional({ description: 'Preparation instructions' })
  @IsOptional()
  @IsString()
  preparation?: string;

  @ApiPropertyOptional({ description: 'Calories', example: 350 })
  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({ description: 'Protein in grams', example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_g?: number;

  @ApiPropertyOptional({ description: 'Carbs in grams', example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs_g?: number;

  @ApiPropertyOptional({ description: 'Fat in grams', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat_g?: number;

  @ApiProperty({
    description: 'Day of week (1=Monday, 7=Sunday)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  day_of_week: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDietPlanDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @ApiProperty({ description: 'Plan title', example: 'Weight Loss Diet Plan' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Goal type',
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking'],
    example: 'weight_loss',
  })
  @IsEnum(['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking'])
  goal_type: string;

  @ApiProperty({ description: 'Target calories per day', example: 1800 })
  @IsInt()
  @Min(0)
  target_calories: number;

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

  @ApiProperty({ description: 'Meals array', type: [CreateDietPlanMealDto] })
  @IsArray()
  @IsNotEmpty()
  meals: CreateDietPlanMealDto[];
}
