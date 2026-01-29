import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DefaultGoalDto {
  @ApiProperty({ example: 'weight_loss' })
  @IsString()
  @IsNotEmpty()
  goal_type: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsNotEmpty()
  target_value: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({ example: 'Lose weight' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['high', 'medium', 'low'], default: 'medium' })
  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';
}

export class CreateGoalTemplateDto {
  @ApiProperty({ example: 'Monthly Weight Loss Template' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['weekly', 'monthly', 'quarterly'] })
  @IsEnum(['weekly', 'monthly', 'quarterly'])
  default_schedule_type: string;

  @ApiProperty({ type: [DefaultGoalDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultGoalDto)
  default_goals: DefaultGoalDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateGoalTemplateDto {
  @ApiPropertyOptional({ example: 'Updated Weight Loss Template' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['weekly', 'monthly', 'quarterly'] })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly'])
  default_schedule_type?: string;

  @ApiPropertyOptional({ type: [DefaultGoalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultGoalDto)
  default_goals?: DefaultGoalDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}
