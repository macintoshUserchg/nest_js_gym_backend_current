import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDietAssignmentDto {
  @ApiProperty({ description: 'Diet Plan ID' })
  @IsUUID()
  @IsNotEmpty()
  diet_plan_id: string;

  @ApiProperty({ description: 'Member ID' })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({ description: 'Start date', example: '2025-01-01' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ description: 'End date', example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class LinkChartDto {
  @ApiProperty({ description: 'Workout chart assignment ID to link' })
  @IsUUID()
  @IsNotEmpty()
  chart_assignment_id: string;
}

export class UpdateDietProgressDto {
  @ApiPropertyOptional({ description: 'Completion percentage', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  completion_percent?: number;

  @ApiPropertyOptional({ description: 'Notes about progress' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DietSubstitutionDto {
  @ApiProperty({ description: 'Original meal name' })
  @IsString()
  @IsNotEmpty()
  original_meal: string;

  @ApiProperty({ description: 'Substituted meal name' })
  @IsString()
  @IsNotEmpty()
  substituted_meal: string;

  @ApiPropertyOptional({ description: 'Reason for substitution' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class FilterDietAssignmentsDto {
  @ApiPropertyOptional({ description: 'Filter by member ID' })
  @IsOptional()
  @IsInt()
  memberId?: number;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
