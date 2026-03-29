import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ReminderType {
  SUBSCRIPTION_EXPIRY = 'subscription_expiry',
  DUE_PAYMENT = 'due_payment',
  RENEWAL_INVOICE = 'renewal_invoice',
  RENEWAL_ACTIVATED = 'renewal_activated',
}

export enum ReminderChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
}

@Entity('reminder_logs')
export class ReminderLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'int', nullable: true })
  memberId?: number;

  @Column({ nullable: true })
  invoiceId?: string;

  @Column({ nullable: true })
  renewalRequestId?: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
  })
  reminderType: ReminderType;

  @Column({
    type: 'enum',
    enum: ReminderChannel,
  })
  channel: ReminderChannel;

  @Column({ type: 'date' })
  referenceDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  sentAt: Date;
}
