import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChartAssignmentStatus } from '../../entities/workout_plan_chart_assignments.entity';

export class UpdateChartAssignmentDto {
  @ApiPropertyOptional({ enum: ChartAssignmentStatus })
  @IsOptional()
  @IsString()
  status?: ChartAssignmentStatus;

  @ApiPropertyOptional({
    description: 'End date for the assignment',
    example: '2024-02-15',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Completion percentage (0-100)',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completion_percent?: number;
}
