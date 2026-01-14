import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { MemberSubscription } from './member_subscriptions.entity';
import { PaymentTransaction } from './payment_transactions.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  invoice_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;

  @ManyToOne(() => MemberSubscription, { nullable: true })
  subscription?: MemberSubscription;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  due_date?: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @OneToMany(() => PaymentTransaction, (payment) => payment.invoice)
  payments: PaymentTransaction[];

  @CreateDateColumn()
  created_at: Date;
}
