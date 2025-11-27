import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

export enum InquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  CLOSED = 'closed',
}

export enum InquirySource {
  WALK_IN = 'walk_in',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  WEBSITE = 'website',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  PRINT_AD = 'print_ad',
  BILLBOARD = 'billboard',
  RADIO = 'radio',
  TELEVISION = 'television',
  OTHER = 'other',
}

export enum PreferredMembershipType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
  FAMILY = 'family',
  CORPORATE = 'corporate',
  STUDENT = 'student',
  SENIOR = 'senior',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  alternatePhone: string;

  @Column({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.NEW })
  status: InquiryStatus;

  @Column({ type: 'enum', enum: InquirySource })
  source: InquirySource;

  @Column({ type: 'enum', enum: PreferredMembershipType, nullable: true })
  preferredMembershipType?: PreferredMembershipType;

  @Column({ nullable: true })
  preferredContactMethod: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  fitnessGoals: string;

  @Column({ default: false })
  hasPreviousGymExperience: boolean;

  @Column({ nullable: true })
  preferredContactTime: string;

  @Column({ default: false })
  wantsPersonalTraining: boolean;

  @Column({ nullable: true })
  referralCode: string;

  @ManyToOne(() => Branch, (branch) => branch.inquiries, { nullable: true })
  branch?: Branch;

  @Column({ nullable: true })
  branchId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  contactedAt: Date;

  @Column({ nullable: true })
  convertedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;
}
