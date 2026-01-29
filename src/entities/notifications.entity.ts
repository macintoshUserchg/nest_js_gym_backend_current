import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './users.entity';

export enum NotificationType {
  // Goal notifications
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  GOAL_COMPLETED = 'GOAL_COMPLETED',
  GOAL_MISSED = 'GOAL_MISSED',
  MILESTONE_COMPLETE = 'MILESTONE_COMPLETE',
  MILESTONE_MISSED = 'MILESTONE_MISSED',

  // Chart/Training notifications
  CHART_ASSIGNED = 'CHART_ASSIGNED',
  CHART_SHARED = 'CHART_SHARED',

  // Diet notifications
  DIET_ASSIGNED = 'DIET_ASSIGNED',

  // Template notifications
  TEMPLATE_FEEDBACK_REQUEST = 'TEMPLATE_FEEDBACK_REQUEST',

  // System notifications
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    entity_type?: string;
    entity_id?: string;
    action?: string;
    related_data?: any;
  };

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
