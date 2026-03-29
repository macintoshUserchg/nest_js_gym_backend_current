import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Verification result status',
    example: 'completed',
    enum: ['completed', 'failed'],
  })
  @IsEnum(['completed', 'failed'])
  @IsNotEmpty()
  status: string;
}
