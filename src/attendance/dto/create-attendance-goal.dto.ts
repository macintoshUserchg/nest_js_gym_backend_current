import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDate,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceGoalDto {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({
    description: 'Goal type',
    enum: ['daily', 'weekly', 'monthly'],
    example: 'weekly',
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  goalType: string;

  @ApiProperty({
    description: 'Target attendance count',
    example: 5,
  })
  @IsInt()
  @Min(1)
  targetCount: number;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-01',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'End date',
    example: '2024-01-31',
  })
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Branch ID (optional)',
    example: 'branch-uuid',
  })
  @IsOptional()
  branchId?: string;
}
