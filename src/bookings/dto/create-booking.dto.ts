import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Class ID to book',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({
    description: 'Booking date (YYYY-MM-DD)',
    example: '2026-04-10',
  })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'First time attending',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
