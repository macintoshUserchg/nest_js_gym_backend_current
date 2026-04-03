import { MaxLength, IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubstitutionDto {
  @ApiProperty({ example: 'Push-ups' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  original_item: string;

  @ApiProperty({ example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  substituted_item: string;

  @ApiPropertyOptional({ example: 'Wrist pain' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty()
  @IsDateString()
  @MaxLength(255)
  date: string;
}

export class CreateTemplateAssignmentDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  template_id: string;

  @ApiProperty({ enum: ['workout', 'diet'] })
  @IsEnum(['workout', 'diet'])
  template_type: 'workout' | 'diet';

  @ApiProperty({ example: 1 })
  @IsInt()
  memberId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  trainer_assignment_id?: number;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ example: 50 })
  @IsInt()
  completion_percent: number;

  @ApiPropertyOptional({ type: [SubstitutionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubstitutionDto)
  substitutions?: SubstitutionDto[];

  @ApiPropertyOptional({ example: 'Completed 3 workouts this week' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class FilterTemplateAssignmentsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  memberId?: number;

  @ApiPropertyOptional({ enum: ['workout', 'diet'] })
  @IsOptional()
  @IsEnum(['workout', 'diet'])
  template_type?: 'workout' | 'diet';

  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled', 'paused'] })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled', 'paused'])
  status?: string;
}
