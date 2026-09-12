import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { Member } from './members.entity';
import { MembershipPlan } from './membership_plans.entity';

@Entity('member_subscriptions')
export class MemberSubscription {
  @ApiProperty({
    description: 'Unique identifier for the member subscription',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Member associated with this subscription',
    type: () => Member,
  })
  @OneToOne(() => Member, (member) => member.subscription, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ name: 'memberId', type: 'int', nullable: false })
  memberId: number;

  @ApiProperty({
    description: 'Membership plan assigned to the member',
    type: () => MembershipPlan,
  })
  @ManyToOne(() => MembershipPlan, (plan) => plan.members)
  @JoinColumn({ name: 'planId' })
  plan: MembershipPlan;

  @Column({ name: 'planId', type: 'int', nullable: false })
  planId: number;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00Z',
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2024-12-31T23:59:59Z',
  })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({
    description: 'Whether the subscription is currently active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Array of selected class IDs for this subscription',
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @Column({ type: 'uuid', array: true, nullable: true })
  selectedClassIds?: string[];
}
