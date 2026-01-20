import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @ApiPropertyOptional({
    description: 'Subscription active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Selected Class IDs (array of UUIDs)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    nullable: true,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  selectedClassIds?: string[];
}
