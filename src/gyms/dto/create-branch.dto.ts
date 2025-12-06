import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Branch name', example: 'Downtown Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Branch email address',
    example: 'downtown@fitzone.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Branch phone number',
    example: '+1234567891',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Branch address',
    example: '456 Downtown Ave, City, State',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Branch location/city',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Branch state', example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the main branch',
    example: false,
  })
  @IsOptional()
  mainBranch?: boolean;

  @ApiPropertyOptional({ description: 'Branch latitude', example: 40.7128 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Branch longitude', example: -74.006 })
  @IsOptional()
  longitude?: number;
}
