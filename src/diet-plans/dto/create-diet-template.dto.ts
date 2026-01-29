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
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDietTemplateMealDto {
  @ApiProperty({ enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'] })
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'])
  meal_type: string;

  @ApiProperty({ example: 'Oatmeal with Fruits' })
  @IsString()
  @IsNotEmpty()
  meal_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ingredients?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preparation?: string;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  protein_g?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  carbs_g?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  fat_g?: number;

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
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alternatives?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  member_can_skip?: boolean;
}

export class CreateDietTemplateDto {
  @ApiProperty({ example: 'Weight Loss Diet Template' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'] })
  @IsEnum(['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'])
  goal_type: string;

  @ApiProperty({ example: 1800 })
  @IsInt()
  @Min(0)
  target_calories: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  protein_g?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  carbs_g?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  fat_g?: number;

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

  @ApiProperty({ type: [CreateDietTemplateMealDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDietTemplateMealDto)
  meals: CreateDietTemplateMealDto[];
}

export class UpdateDietTemplateDto {
  @ApiPropertyOptional({ example: 'Updated Weight Loss Diet' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'] })
  @IsOptional()
  @IsEnum(['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'])
  goal_type?: string;

  @ApiPropertyOptional({ example: 1800 })
  @IsOptional()
  @IsInt()
  @Min(0)
  target_calories?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  protein_g?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  carbs_g?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  fat_g?: number;

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

export class CopyDietTemplateDto {
  @ApiProperty({ example: 'My Copied Diet Template' })
  @IsString()
  @IsNotEmpty()
  new_title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  new_description?: string;
}

export class RateDietTemplateDto {
  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  rating: number;
}

export class SubstituteMealDto {
  @ApiProperty({ description: 'Original meal name' })
  @IsString()
  @IsNotEmpty()
  original_meal: string;

  @ApiProperty({ description: 'Substituted meal name' })
  @IsString()
  @IsNotEmpty()
  substituted_meal: string;

  @ApiPropertyOptional({ description: 'Reason for substitution' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AssignDietTemplateDto {
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
}
