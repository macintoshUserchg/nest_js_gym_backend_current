import { MaxLength, IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealLibraryDto {
  @ApiProperty({ description: 'Meal name', example: 'Grilled Chicken Salad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  meal_name: string;

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
    example: 'lunch',
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
  calories?: number;

  @ApiPropertyOptional({ description: 'Protein in grams', example: 30.5 })
  @IsOptional()
  @IsNumber()
  protein_g?: number;

  @ApiPropertyOptional({ description: 'Carbohydrates in grams', example: 25.0 })
  @IsOptional()
  @IsNumber()
  carbs_g?: number;

  @ApiPropertyOptional({ description: 'Fat in grams', example: 12.5 })
  @IsOptional()
  @IsNumber()
  fat_g?: number;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  image_url?: string;
}
