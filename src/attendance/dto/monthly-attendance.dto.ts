import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MonthlyAttendanceDto {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
  })
  @IsInt()
  year: number;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 1,
  })
  @IsInt()
  month: number;

  @ApiPropertyOptional({
    description: 'Branch ID (optional)',
    example: 'branch-uuid',
  })
  @IsOptional()
  branchId?: string;
}
