import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Member } from './members.entity';
import { MembershipPlan } from './membership_plans.entity';

@Entity('member_subscriptions')
export class MemberSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Member, (member) => member.subscription)
  member: Member;

  @ManyToOne(() => MembershipPlan, (plan) => plan.members)
  plan: MembershipPlan;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
