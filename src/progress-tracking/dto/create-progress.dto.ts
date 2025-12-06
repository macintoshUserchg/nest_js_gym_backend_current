import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @ApiProperty({ description: 'Record date', example: '2024-01-01' })
  @IsDateString()
  record_date: Date;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_kg?: number;

  @ApiPropertyOptional({ description: 'Height in cm', example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height_cm?: number;

  @ApiPropertyOptional({ description: 'Body fat percentage', example: 15.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  body_fat_percentage?: number;

  @ApiPropertyOptional({ description: 'Muscle mass in kg', example: 30.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  muscle_mass_kg?: number;

  @ApiPropertyOptional({ description: 'BMI', example: 24.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bmi?: number;

  @ApiPropertyOptional({ description: 'Chest measurement in cm', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chest_cm?: number;

  @ApiPropertyOptional({ description: 'Waist measurement in cm', example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waist_cm?: number;

  @ApiPropertyOptional({ description: 'Arms measurement in cm', example: 35 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  arms_cm?: number;

  @ApiPropertyOptional({ description: 'Thighs measurement in cm', example: 55 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  thighs_cm?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Achievements or milestones' })
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ description: 'Trainer ID (optional)', example: 1 })
  @IsOptional()
  @IsNumber()
  trainerId?: number;
}
