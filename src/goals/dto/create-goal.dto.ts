import { MaxLength, IsNumber, IsOptional, IsString, IsBoolean} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Member ID for whom the goal is being set',
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

  @ApiProperty({
    description: 'Type of goal',
    example: 'Weight Loss',
  })
  @IsString()
  @MaxLength(100)
  goal_type: string;

  @ApiPropertyOptional({
    description: 'Target value for the goal',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  target_value?: number;

  @ApiPropertyOptional({
    description: 'Target completion date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  target_timeline?: string;

  @ApiPropertyOptional({
    description: 'Milestones for the goal',
    example: {
      month1: 'Lose 2 kg',
      month2: 'Lose 4 kg',
      month3: 'Lose 6 kg',
    },
  })
  @IsOptional()
  milestone?: any;

  @ApiPropertyOptional({
    description: 'Current status of the goal',
    example: 'active',
    enum: ['active', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Completion percentage',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  completion_percent?: number;

  @ApiPropertyOptional({
    description: 'Flag indicating if member can manage their own goals',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_managed_by_member?: boolean;
}
