import { MaxLength, IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsUUID,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipPlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Premium Monthly' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Plan price in cents', example: 4999 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Plan duration in days', example: 30 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationInDays: number;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Full access to all gym facilities',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}
