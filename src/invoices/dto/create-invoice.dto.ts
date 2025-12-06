import {
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Member ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @ApiPropertyOptional({ description: 'Subscription ID', example: 1 })
  @IsInt()
  @IsOptional()
  subscriptionId?: number;

  @ApiProperty({ description: 'Total amount', example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Invoice description',
    example: 'Monthly membership fee',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
