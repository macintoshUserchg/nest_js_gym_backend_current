import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'Updated payment status',
    example: 'completed',
    enum: ['completed', 'failed'],
  })
  @IsEnum(['completed', 'failed'])
  status: string;

  @ApiPropertyOptional({
    description: 'Admin notes about verification or rejection',
    example: 'Payment verified by admin',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
