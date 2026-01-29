import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trainer } from './trainers.entity';
import { Member } from './members.entity';

@Entity('goal_schedules')
export class GoalSchedule {
  @PrimaryGeneratedColumn('uuid')
  schedule_id: string;

  @Column({ type: 'int', nullable: true })
  assigned_trainerId?: number;

  @ManyToOne(() => Trainer, { nullable: true })
  assigned_trainer?: Trainer;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['weekly', 'monthly', 'quarterly'],
  })
  schedule_type: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', default: 1 })
  current_period: number;

  @Column({ type: 'jsonb' })
  target_goals: {
    id?: string;
    goal_type: string;
    target_value: number;
    unit: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    is_completed?: boolean;
    completed_value?: number;
    completed_at?: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  period_progress?: {
    period_number: number;
    completed_goals: { goal_id: string; achieved_value: number; completion_date: Date }[];
    member_notes?: string;
    trainer_notes?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'missed';
  }[];

  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
  })
  status: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'date', nullable: true })
  last_activity_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
