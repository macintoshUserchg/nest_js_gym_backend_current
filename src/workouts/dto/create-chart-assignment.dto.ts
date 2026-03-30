import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChartAssignmentDto {
  @ApiProperty({ description: 'UUID of the workout chart to assign' })
  @IsUUID()
  chart_id: string;

  @ApiProperty({ description: 'Member ID to assign the chart to', example: 1 })
  @IsInt()
  @Min(1)
  memberId: number;

  @ApiProperty({
    description: 'Start date for the assignment',
    example: '2024-01-15',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    description: 'End date for the assignment',
    example: '2024-02-15',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Optional notes for the assignment' })
  @IsOptional()
  @IsString()
  notes?: string;
}
