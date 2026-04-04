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

export class FilterMealLibraryDto {
  @ApiPropertyOptional({
    description: 'Filter by meal type',
    enum: [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'pre_workout',
      'post_workout',
    ],
  })
  @IsOptional()
  @IsEnum([
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'pre_workout',
    'post_workout',
  ])
  meal_type?: string;

  @ApiPropertyOptional({ description: 'Search by meal name' })
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
