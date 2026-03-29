import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateRenewalRequestDto {
  @ApiProperty({
    description: 'Membership plan selected for renewal',
    example: 2,
  })
  @IsInt()
  @Min(1)
  planId: number;
}
