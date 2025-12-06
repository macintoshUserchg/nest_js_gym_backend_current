import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: 'Class name', example: 'Yoga Basics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Class description',
    example: 'Beginner-friendly yoga class',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Class timings',
    example: 'morning',
    enum: ['morning', 'evening', 'both', 'either'],
  })
  @IsEnum(['morning', 'evening', 'both', 'either'])
  @IsOptional()
  timings?: string;

  // Recurrence fields
  @ApiPropertyOptional({
    description: 'Recurrence type',
    example: 'weekly',
    enum: ['daily', 'weekly', 'monthly'],
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  recurrenceType?: string;

  @ApiPropertyOptional({
    description: 'Days of week (0=Sunday, 6=Saturday)',
    example: [1, 3, 5],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  daysOfWeek?: number[];
}
