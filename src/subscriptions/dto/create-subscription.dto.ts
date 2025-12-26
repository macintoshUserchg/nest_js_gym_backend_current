import { IsNotEmpty, IsInt, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({ description: 'Membership Plan ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  planId: number;

  @ApiPropertyOptional({
    description: 'Selected Class ID (optional, UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  selectedClassId?: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}
