import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Member } from './members.entity';
import { Class } from './classes.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  WAITLIST = 'waitlist',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

@Entity('bookings')
@Index('IDX_booking_class_member_date', ['class', 'member', 'bookingDate'])
@Index('IDX_booking_status', ['status'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, { nullable: false, onDelete: 'CASCADE' })
  class: Class;

  @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
  member: Member;

  @Column({ type: 'date' })
  bookingDate: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({ type: 'int', default: 0 })
  waitlistPosition: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelledBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
