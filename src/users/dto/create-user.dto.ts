import { MaxLength, IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  Matches,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'Role ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Gym ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  gymId?: string;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'User mobile number in E.164 format',
    example: '+919876543210',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  @IsOptional()
  phoneNumber?: string;
}
