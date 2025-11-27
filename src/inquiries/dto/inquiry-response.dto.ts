import { ApiProperty } from '@nestjs/swagger';
import { Inquiry } from '../../entities/inquiry.entity';
import { Branch } from '../../entities/branch.entity';

export class InquiryResponseDto {
  @ApiProperty({ description: 'Inquiry ID' })
  id: number;

  @ApiProperty({ description: 'Customer full name' })
  fullName: string;

  @ApiProperty({ description: 'Customer email address' })
  email: string;

  @ApiProperty({ description: 'Customer phone number', nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Alternate phone number', nullable: true })
  alternatePhone?: string;

  @ApiProperty({ description: 'Current status of the inquiry' })
  status: string;

  @ApiProperty({ description: 'Source of the inquiry' })
  source: string;

  @ApiProperty({ description: 'Preferred membership type', nullable: true })
  preferredMembershipType?: string;

  @ApiProperty({ description: 'Preferred contact method', nullable: true })
  preferredContactMethod?: string;

  @ApiProperty({ description: 'Additional notes', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Address line 1', nullable: true })
  addressLine1?: string;

  @ApiProperty({ description: 'Address line 2', nullable: true })
  addressLine2?: string;

  @ApiProperty({ description: 'City', nullable: true })
  city?: string;

  @ApiProperty({ description: 'State/Province', nullable: true })
  state?: string;

  @ApiProperty({ description: 'Postal code', nullable: true })
  postalCode?: string;

  @ApiProperty({ description: 'Date of birth', nullable: true })
  dateOfBirth?: Date;

  @ApiProperty({ description: 'Customer occupation', nullable: true })
  occupation?: string;

  @ApiProperty({ description: 'Customer fitness goals', nullable: true })
  fitnessGoals?: string;

  @ApiProperty({ description: 'Has previous gym experience' })
  hasPreviousGymExperience: boolean;

  @ApiProperty({ description: 'Preferred contact time', nullable: true })
  preferredContactTime?: string;

  @ApiProperty({ description: 'Wants personal training' })
  wantsPersonalTraining: boolean;

  @ApiProperty({ description: 'Referral code', nullable: true })
  referralCode?: string;

  @ApiProperty({ description: 'Associated branch information', nullable: true })
  branch?: Branch;

  @ApiProperty({ description: 'Branch ID', nullable: true })
  branchId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Contact attempts timestamp', nullable: true })
  contactedAt?: Date;

  @ApiProperty({ description: 'Conversion timestamp', nullable: true })
  convertedAt?: Date;

  @ApiProperty({ description: 'Closure timestamp', nullable: true })
  closedAt?: Date;

  constructor(inquiry: Inquiry) {
    this.id = inquiry.id;
    this.fullName = inquiry.fullName;
    this.email = inquiry.email;
    this.phone = inquiry.phone;
    this.alternatePhone = inquiry.alternatePhone;
    this.status = inquiry.status;
    this.source = inquiry.source;
    this.preferredMembershipType = inquiry.preferredMembershipType;
    this.preferredContactMethod = inquiry.preferredContactMethod;
    this.notes = inquiry.notes;
    this.addressLine1 = inquiry.addressLine1;
    this.addressLine2 = inquiry.addressLine2;
    this.city = inquiry.city;
    this.state = inquiry.state;
    this.postalCode = inquiry.postalCode;
    this.dateOfBirth = inquiry.dateOfBirth;
    this.occupation = inquiry.occupation;
    this.fitnessGoals = inquiry.fitnessGoals;
    this.hasPreviousGymExperience = inquiry.hasPreviousGymExperience;
    this.preferredContactTime = inquiry.preferredContactTime;
    this.wantsPersonalTraining = inquiry.wantsPersonalTraining;
    this.referralCode = inquiry.referralCode;
    this.branch = inquiry.branch;
    this.branchId = inquiry.branchId;
    this.createdAt = inquiry.createdAt;
    this.updatedAt = inquiry.updatedAt;
    this.contactedAt = inquiry.contactedAt;
    this.convertedAt = inquiry.convertedAt;
    this.closedAt = inquiry.closedAt;
  }
}
