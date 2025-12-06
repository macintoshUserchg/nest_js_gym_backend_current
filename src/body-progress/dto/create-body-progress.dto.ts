import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBodyProgressDto {
  @ApiProperty({
    description: 'Member ID for whom the body progress is being recorded',
    example: 123,
  })
  @IsNumber()
  memberId: number;

  @ApiPropertyOptional({
    description: 'Trainer ID (optional)',
    example: 456,
  })
  @IsOptional()
  @IsNumber()
  trainerId?: number;

  @ApiPropertyOptional({
    description: 'Weight in kg',
    example: 75.5,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Body fat percentage',
    example: 15.5,
  })
  @IsOptional()
  @IsNumber()
  body_fat?: number;

  @ApiPropertyOptional({
    description: 'Body Mass Index',
    example: 24.5,
  })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiPropertyOptional({
    description: 'Body measurements',
    example: {
      chest: 100,
      waist: 85,
      arms: 35,
      thighs: 55,
    },
  })
  @IsOptional()
  measurements?: any;

  @ApiPropertyOptional({
    description: 'Progress photos URLs',
    example: {
      front: 'https://example.com/front.jpg',
      side: 'https://example.com/side.jpg',
      back: 'https://example.com/back.jpg',
    },
  })
  @IsOptional()
  progress_photos?: any;

  @ApiProperty({
    description: 'Date of the body progress record',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;
}
