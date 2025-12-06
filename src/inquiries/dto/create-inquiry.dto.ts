import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InquirySource,
  PreferredMembershipType,
  InquiryStatus,
} from '../../entities/inquiry.entity';

export class CreateInquiryDto {
  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Alternate phone number',
    example: '+0987654321',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  alternatePhone?: string;

  @ApiProperty({
    description: 'How the customer found out about the gym',
    enum: InquirySource,
  })
  @IsEnum(InquirySource)
  @IsNotEmpty()
  source: InquirySource;

  @ApiPropertyOptional({
    description: 'Preferred membership type',
    enum: PreferredMembershipType,
  })
  @IsEnum(PreferredMembershipType)
  @IsOptional()
  preferredMembershipType?: PreferredMembershipType;

  @ApiPropertyOptional({
    description: 'Preferred contact method',
    example: 'email',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  preferredContactMethod?: string;

  @ApiPropertyOptional({ description: 'Additional notes or comments' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Main Street',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province', example: 'NY' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '10001' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Customer occupation',
    example: 'Software Engineer',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Customer fitness goals',
    example: 'Weight loss, Muscle building',
  })
  @IsString()
  @IsOptional()
  fitnessGoals?: string;

  @ApiPropertyOptional({
    description: 'Has previous gym experience',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasPreviousGymExperience?: boolean = false;

  @ApiPropertyOptional({
    description: 'Preferred contact time',
    example: 'morning',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  preferredContactTime?: string;

  @ApiPropertyOptional({
    description: 'Wants personal training',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  wantsPersonalTraining?: boolean = false;

  @ApiPropertyOptional({ description: 'Referral code if applicable' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  referralCode?: string;

  @ApiPropertyOptional({
    description: 'Branch ID where inquiry is made',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}
