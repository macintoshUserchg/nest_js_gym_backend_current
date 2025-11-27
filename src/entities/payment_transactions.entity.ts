import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoices.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @ManyToOne(() => Invoice, invoice => invoice.payments)
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['cash', 'card', 'online', 'bank_transfer'] })
  method: string;

  @Column({ nullable: true })
  reference_number?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed'], default: 'completed' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
