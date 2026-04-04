import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class FilterExerciseDto {
  @ApiPropertyOptional({
    description: 'Filter by body part',
    enum: ['upper_body', 'lower_body', 'core', 'cardio', 'full_body'],
  })
  @IsOptional()
  @IsEnum(['upper_body', 'lower_body', 'core', 'cardio', 'full_body'])
  body_part?: string;

  @ApiPropertyOptional({
    description: 'Filter by exercise type',
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'],
  })
  @IsOptional()
  @IsEnum(['strength', 'cardio', 'flexibility', 'endurance', 'general'])
  exercise_type?: string;

  @ApiPropertyOptional({
    description: 'Filter by difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: string;

  @ApiPropertyOptional({ description: 'Search by exercise name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
