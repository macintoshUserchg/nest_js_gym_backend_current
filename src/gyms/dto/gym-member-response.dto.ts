import { ApiProperty } from '@nestjs/swagger';

export class GymMemberSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Plan name', example: 'Elite Basic - Downtown' })
  name: string;

  @ApiProperty({ description: 'Plan price in cents', example: 8999 })
  price: number;

  @ApiProperty({ description: 'Duration in days', example: 30 })
  durationInDays: number;

  @ApiProperty({
    description: 'Plan description',
    example: 'Access to premium gym facilities and basic classes',
  })
  description: string;
}

export class GymMemberClassDto {
  @ApiProperty({
    description: 'Class ID (UUID)',
    example: '8cd45646-061b-4730-a2a5-1f400226564b',
  })
  classId: string;

  @ApiProperty({ description: 'Class name', example: 'Elite Morning Yoga' })
  name: string;

  @ApiProperty({
    description: 'Class description',
    example:
      'Premium yoga session to start your day with mindfulness and strength',
  })
  description: string;

  @ApiProperty({
    description: 'Class timings',
    example: 'morning',
    enum: ['morning', 'afternoon', 'evening'],
  })
  timings: string;

  @ApiProperty({
    description: 'Recurrence type',
    example: 'weekly',
    enum: ['daily', 'weekly', 'monthly'],
  })
  recurrenceType: string;

  @ApiProperty({
    description: 'Days of week (1=Monday, 7=Sunday)',
    example: [1, 3, 5],
    type: [Number],
  })
  daysOfWeek: number[];
}

export class GymMemberSubscriptionDto {
  @ApiProperty({ description: 'Subscription ID', example: 101 })
  id: number;

  @ApiProperty({
    type: GymMemberSubscriptionPlanDto,
    description: 'Associated membership plan',
  })
  plan: GymMemberSubscriptionPlanDto;

  @ApiProperty({ type: [GymMemberClassDto], description: 'Enrolled classes' })
  classes: GymMemberClassDto[];

  @ApiProperty({
    description: 'Subscription start date',
    example: '2026-01-16T17:13:21.315Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2026-02-15T17:13:21.315Z',
  })
  endDate: string;

  @ApiProperty({
    description: 'Whether subscription is currently active',
    example: true,
  })
  isActive: boolean;
}

export class GymMemberBranchDto {
  @ApiProperty({
    description: 'Branch ID (UUID)',
    example: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
  })
  branchId: string;

  @ApiProperty({
    description: 'Branch name',
    example: 'Fitness First Elite - Downtown',
  })
  name: string;

  @ApiProperty({
    description: 'Branch email',
    example: 'downtown@fitnessfirstelite.com',
  })
  email: string;

  @ApiProperty({ description: 'Branch phone', example: '+1-555-0101' })
  phone: string;

  @ApiProperty({
    description: 'Branch address',
    example: '123 Elite Fitness Drive, Wellness City, WC 90210',
  })
  address: string;

  @ApiProperty({ description: 'Branch location/city', example: 'Downtown' })
  location: string;

  @ApiProperty({ description: 'Branch state', example: 'California' })
  state: string;

  @ApiProperty({
    description: 'Whether this is the main branch',
    example: true,
  })
  mainBranch: boolean;

  @ApiProperty({
    description: 'Branch latitude coordinate',
    example: 34.0522,
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Branch longitude coordinate',
    example: -118.2437,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Branch creation timestamp',
    example: '2026-01-15T17:28:12.198Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Branch last update timestamp',
    example: '2026-01-15T17:28:12.198Z',
  })
  updatedAt: string;
}

export class GymMemberResponseDto {
  @ApiProperty({ description: 'Member ID', example: 101 })
  id: number;

  @ApiProperty({ description: 'Full name of the member', example: 'John Doe' })
  fullName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  phone: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  gender: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-15' })
  dateOfBirth: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main Street' })
  addressLine1: string;

  @ApiProperty({
    description: 'Address line 2',
    example: 'Apt 4B',
    nullable: true,
  })
  addressLine2: string | null;

  @ApiProperty({ description: 'City', example: 'New York' })
  city: string;

  @ApiProperty({ description: 'State', example: 'NY' })
  state: string;

  @ApiProperty({ description: 'Postal code', example: '10001' })
  postalCode: string;

  @ApiProperty({
    description: 'URL to member avatar image',
    example: 'https://example.com/avatars/john.jpg',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'URL to member attachment document',
    example: 'https://example.com/docs/john-id.pdf',
    nullable: true,
  })
  attachmentUrl: string | null;

  @ApiProperty({ description: 'Emergency contact name', example: 'Jane Doe' })
  emergencyContactName: string;

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '9876543210',
  })
  emergencyContactPhone: string;

  @ApiProperty({ description: 'Whether the member is active', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the member account is frozen',
    example: false,
  })
  freezeMember: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-16T17:13:21.316Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-16T17:13:21.316Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Associated branch ID (UUID)',
    example: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
  })
  branchBranchId: string;

  @ApiProperty({
    description: 'Whether member manages their own account',
    example: true,
  })
  is_managed_by_member: boolean;

  @ApiProperty({
    type: GymMemberSubscriptionDto,
    description: 'Member subscription details',
  })
  subscription: GymMemberSubscriptionDto;

  @ApiProperty({ type: GymMemberBranchDto, description: 'Branch details' })
  branch: GymMemberBranchDto;
}
