import { MaxLength, IsNotEmpty, IsString, IsOptional, IsObject} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  userId: string;

  @ApiProperty({ description: 'Action performed', example: 'CREATE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  action: string;

  @ApiProperty({ description: 'Entity type', example: 'Member' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  entityType: string;

  @ApiProperty({ description: 'Entity ID', example: '123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  entityId: string;

  @ApiPropertyOptional({
    description: 'Previous values',
    example: { name: 'Old Name' },
  })
  @IsObject()
  @IsOptional()
  previousValues?: any;

  @ApiPropertyOptional({
    description: 'New values',
    example: { name: 'New Name' },
  })
  @IsObject()
  @IsOptional()
  newValues?: any;
}
