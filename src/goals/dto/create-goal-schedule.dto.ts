import { MaxLength, IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TargetGoalDto {
  @ApiProperty({ example: 'weight_loss' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  goal_type: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  target_value: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @ApiPropertyOptional({ example: 'Lose 5kg this month' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['high', 'medium', 'low'], default: 'medium' })
  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';
}

export class CreateGoalScheduleDto {
  @ApiProperty({ description: 'Member ID', example: 123 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiPropertyOptional({ description: 'Trainer ID (if assigned)', example: 1 })
  @IsOptional()
  @IsInt()
  trainerId?: number;

  @ApiProperty({ example: 'Monthly Fitness Goals - January' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['weekly', 'monthly', 'quarterly'] })
  @IsEnum(['weekly', 'monthly', 'quarterly'])
  @MaxLength(50)
  schedule_type: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ type: [TargetGoalDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetGoalDto)
  target_goals: TargetGoalDto[];
}

export class CreateGoalScheduleFromTemplateDto {
  @ApiProperty({ description: 'Goal template ID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  templateId: string;

  @ApiProperty({ description: 'Member ID', example: 123 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiPropertyOptional({ description: 'Trainer ID (if assigned)', example: 1 })
  @IsOptional()
  @IsInt()
  trainerId?: number;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  end_date: string;
}

export class UpdatePeriodProgressDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  period_number: number;

  @ApiProperty({ type: [Object] })
  completed_goals: {
    goal_id: string;
    achieved_value: number;
    completion_date: string;
  }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  member_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trainer_notes?: string;

  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'missed'] })
  @IsEnum(['pending', 'in_progress', 'completed', 'missed'])
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
}

export class UpdateGoalStatusDto {
  @ApiProperty({ example: 'completed' })
  @IsEnum(['completed'])
  status: 'completed';

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  completed_value: number;
}

export class FilterGoalsDto {
  @ApiPropertyOptional({ description: 'Filter by member ID' })
  @IsOptional()
  @IsInt()
  memberId?: number;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled', 'paused'] })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled', 'paused'])
  status?: string;

  @ApiPropertyOptional({ enum: ['weekly', 'monthly', 'quarterly'] })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly'])
  schedule_type?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
