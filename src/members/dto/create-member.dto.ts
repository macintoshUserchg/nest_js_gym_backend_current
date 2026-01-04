import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';

export class CreateMemberDto {
  @ApiProperty({ description: 'Member full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Main St',
  })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '10001' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Member avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '0987654321',
  })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'Membership plan ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  membershipPlanId: number;

  @ApiPropertyOptional({
    description: 'Member active status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Member attachment URL',
    example: 'https://example.com/attachment.pdf',
  })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({
    description: 'Member freeze status',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  freezMember?: boolean;
}
