import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Payment amount', example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'card',
    enum: ['cash', 'card', 'online', 'bank_transfer'],
  })
  @IsEnum(['cash', 'card', 'online', 'bank_transfer'])
  @IsNotEmpty()
  method: string;

  @ApiPropertyOptional({
    description: 'Reference number',
    example: 'TXN123456',
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Payment notes',
    example: 'Paid via credit card',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
