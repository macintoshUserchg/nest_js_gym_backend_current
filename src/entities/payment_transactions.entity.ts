import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoices.entity';
import { User } from './users.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, {
    onDelete: 'CASCADE',
  })
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['cash', 'card', 'online', 'bank_transfer'] })
  method: string;

  @Column({ nullable: true })
  reference_number?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refund'],
    default: 'completed',
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  recorded_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recorded_by?: User;

  @Column({ type: 'uuid', nullable: true })
  verified_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_user_id' })
  verified_by?: User;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @Column({ type: 'text', nullable: true })
  refund_reason?: string;

  @Column({ type: 'uuid', nullable: true })
  original_transaction_id?: string;

  @ManyToOne(() => PaymentTransaction, { nullable: true })
  @JoinColumn({ name: 'original_transaction_id' })
  original_transaction?: PaymentTransaction;

  @Column({ type: 'date', nullable: true })
  payment_date?: Date;

  @CreateDateColumn()
  created_at: Date;
}
