import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Member } from './members.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  memberId: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ default: true })
  smsEnabled: boolean;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: false })
  phoneVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
