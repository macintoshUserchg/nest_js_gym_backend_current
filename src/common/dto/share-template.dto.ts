import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareTemplateDto {
  @ApiProperty({ description: 'Template ID to share' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'Template type', enum: ['workout', 'diet', 'goal'] })
  @IsEnum(['workout', 'diet', 'goal'])
  templateType: string;

  @ApiProperty({ description: 'Trainer ID to share with' })
  @IsInt()
  @IsNotEmpty()
  trainerId: number;

  @ApiPropertyOptional({ description: 'Note from admin' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class AcceptSharedTemplateDto {
  @ApiProperty({ description: 'Share ID to accept' })
  @IsUUID()
  @IsNotEmpty()
  shareId: string;
}

export class UpdateAssignmentTemplatesDto {
  @ApiPropertyOptional({ description: 'Workout template ID' })
  @IsOptional()
  @IsUUID()
  workoutTemplateId?: string;

  @ApiPropertyOptional({ description: 'Diet template ID' })
  @IsOptional()
  @IsUUID()
  dietTemplateId?: string;

  @ApiPropertyOptional({ description: 'Workout start date' })
  @IsOptional()
  @IsDateString()
  workoutStartDate?: string;

  @ApiPropertyOptional({ description: 'Workout end date' })
  @IsOptional()
  @IsDateString()
  workoutEndDate?: string;

  @ApiPropertyOptional({ description: 'Diet start date' })
  @IsOptional()
  @IsDateString()
  dietStartDate?: string;

  @ApiPropertyOptional({ description: 'Diet end date' })
  @IsOptional()
  @IsDateString()
  dietEndDate?: string;
}

export class ApplyTemplateToMemberDto {
  @ApiProperty({ description: 'Member ID' })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiPropertyOptional({ description: 'Workout template ID' })
  @IsOptional()
  @IsUUID()
  workoutTemplateId?: string;

  @ApiPropertyOptional({ description: 'Diet template ID' })
  @IsOptional()
  @IsUUID()
  dietTemplateId?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
