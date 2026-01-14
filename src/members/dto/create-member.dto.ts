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
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';

export class CreateMemberDto {
  @ApiProperty({ description: 'Member full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
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
  @MaxLength(500)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'NY' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '10001' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Member avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '0987654321',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
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
  @MaxLength(500)
  attachmentUrl?: string;

  @ApiPropertyOptional({
    description: 'Member freeze status',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  freezMember?: boolean;

  @ApiPropertyOptional({
    description: 'Array of class IDs for this subscription',
    type: [String],
    example: ['ab1caf4b-bb4c-489e-aefd-ad6031fc92b1'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  selectedClassIds?: string[];
}
