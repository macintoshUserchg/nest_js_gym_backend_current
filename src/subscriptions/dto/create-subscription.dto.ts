import { IsNotEmpty, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({ description: 'Membership Plan ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  planId: number;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}
