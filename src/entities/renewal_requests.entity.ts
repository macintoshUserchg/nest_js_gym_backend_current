import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { MembershipPlan } from './membership_plans.entity';
import { Invoice } from './invoices.entity';
import { MemberSubscription } from './member_subscriptions.entity';

export enum RenewalStatus {
  REQUESTED = 'requested',
  INVOICED = 'invoiced',
  PAID = 'paid',
  ACTIVATED = 'activated',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('renewal_requests')
export class RenewalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE', eager: true })
  member: Member;

  @ManyToOne(() => MembershipPlan, { eager: true })
  requestedPlan: MembershipPlan;

  @ManyToOne(() => MemberSubscription, { nullable: true, eager: true })
  currentSubscription?: MemberSubscription;

  @OneToOne(() => Invoice, { nullable: true, eager: true })
  @JoinColumn()
  invoice?: Invoice;

  @Column({
    type: 'enum',
    enum: RenewalStatus,
    default: RenewalStatus.REQUESTED,
  })
  status: RenewalStatus;

  @Column({ type: 'timestamp' })
  requestedStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
