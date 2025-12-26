import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Member } from './members.entity';
import { MembershipPlan } from './membership_plans.entity';
import { Class } from './classes.entity';

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
  @OneToOne(() => Member, (member) => member.subscription)
  member: Member;

  @ApiProperty({
    description: 'Membership plan assigned to the member',
    type: () => MembershipPlan,
  })
  @ManyToOne(() => MembershipPlan, (plan) => plan.members)
  plan: MembershipPlan;

  @ApiPropertyOptional({
    description: 'Selected class for this subscription (optional)',
    type: () => Class,
    nullable: true,
  })
  @ManyToOne(() => Class, { nullable: true })
  selectedClass?: Class;

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
}
