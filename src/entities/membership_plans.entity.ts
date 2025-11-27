import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { MemberSubscription } from './member_subscriptions.entity';
import { Branch } from './branch.entity';

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  durationInDays: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @OneToMany(() => MemberSubscription, sub => sub.plan)
  members: MemberSubscription[];
}
