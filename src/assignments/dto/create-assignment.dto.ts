import { IsNotEmpty, IsInt, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({ description: 'Trainer ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  trainerId: number;

  @ApiProperty({ description: 'Assignment start date', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ description: 'Assignment end date', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Assignment status', example: 'active', enum: ['active', 'ended'] })
  @IsEnum(['active', 'ended'])
  @IsOptional()
  status?: string;
}
