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
  @ApiProperty({
    description: 'Full name of the member',
    example: 'Alice Johnson',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Unique email address of the member',
    example: 'alice.johnson@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number with country code',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Gender of the member',
    enum: Gender,
    example: 'female',
    enumName: 'Gender',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Date of birth in YYYY-MM-DD format',
    example: '1992-05-20',
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Primary address line',
    example: '456 Oak Avenue',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Secondary address line (apartment, suite, etc.)',
    example: 'Apt 4B',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Los Angeles',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'State or province abbreviation',
    example: 'CA',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal or ZIP code',
    example: '90001',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'URL to member avatar image',
    example: 'https://example.com/avatars/alice.jpg',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Name of emergency contact person',
    example: 'Bob Johnson',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of emergency contact',
    example: '+1-555-987-6543',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @ApiProperty({
    description: 'UUID of the branch/gym location',
    example: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'ID of the membership plan to assign',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  membershipPlanId: number;

  @ApiPropertyOptional({
    description: 'Whether the member account is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'URL to member ID or document attachment',
    example: 'https://example.com/documents/alice-id.pdf',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  attachmentUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the membership is frozen (paused)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  freezeMember?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the member manages their own account',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_managed_by_member?: boolean;

  @ApiPropertyOptional({
    description: 'Array of UUIDs for classes to include in subscription',
    type: [String],
    example: [
      '8cd45646-061b-4730-a2a5-1f400226564b',
      '33ec8f27-0708-4808-958f-091301f8aa2c',
    ],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  selectedClassIds?: string[];
}
