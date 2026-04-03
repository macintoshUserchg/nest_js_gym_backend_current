import { MaxLength, IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount', example: 50.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Refund method',
    example: 'card',
    enum: ['cash', 'card', 'bank_transfer'],
  })
  @IsEnum(['cash', 'card', 'bank_transfer'])
  @IsNotEmpty()
  refundMethod: string;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested cancellation',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
