import { MaxLength, IsEnum, IsNotEmpty, IsString, IsOptional} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ description: 'Exercise name', example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  exercise_name: string;

  @ApiProperty({
    description: 'Body part',
    enum: ['upper_body', 'lower_body', 'core', 'cardio', 'full_body'],
    example: 'upper_body',
  })
  @IsEnum(['upper_body', 'lower_body', 'core', 'cardio', 'full_body'])
  body_part: string;

  @ApiProperty({
    description: 'Exercise type',
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'],
    example: 'strength',
  })
  @IsEnum(['strength', 'cardio', 'flexibility', 'endurance', 'general'])
  exercise_type: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'intermediate',
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level: string;

  @ApiPropertyOptional({ description: 'Exercise description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Exercise instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Benefits of this exercise' })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional({ description: 'Precautions and safety tips' })
  @IsOptional()
  @IsString()
  precautions?: string;

  @ApiPropertyOptional({ description: 'Video URL for demonstration' })
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiPropertyOptional({ description: 'Image URL for reference' })
  @IsOptional()
  @IsString()
  image_url?: string;
}
