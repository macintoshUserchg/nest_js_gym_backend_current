import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaymentFilterDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO format)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO format)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: ['cash', 'card', 'online', 'bank_transfer'],
  })
  @IsEnum(['cash', 'card', 'online', 'bank_transfer'])
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: ['pending', 'completed', 'failed', 'refund'],
  })
  @IsEnum(['pending', 'completed', 'failed', 'refund'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
