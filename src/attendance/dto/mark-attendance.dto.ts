import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiPropertyOptional({ description: 'Member ID', example: 1 })
  @IsInt()
  @ValidateIf((o) => !o.trainerId)
  @IsOptional()
  memberId?: number;

  @ApiPropertyOptional({ description: 'Trainer ID', example: 1 })
  @IsInt()
  @ValidateIf((o) => !o.memberId)
  @IsOptional()
  trainerId?: number;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({ description: 'Notes', example: 'Regular check-in' })
  @IsString()
  @IsOptional()
  notes?: string;
}
