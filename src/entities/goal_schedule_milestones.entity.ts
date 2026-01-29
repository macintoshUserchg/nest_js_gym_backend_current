import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GoalSchedule } from './goal_schedules.entity';

@Entity('goal_schedule_milestones')
export class GoalScheduleMilestone {
  @PrimaryGeneratedColumn('uuid')
  milestone_id: string;

  @ManyToOne(() => GoalSchedule, { onDelete: 'CASCADE' })
  schedule: GoalSchedule;

  @Column({ length: 50 })
  period_label: string; // "Week 1", "Month 1"

  @Column({ type: 'int', default: 1 })
  sequence_order: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  target_value: number;

  @Column({ length: 50 })
  unit: string; // kg, reps, sessions, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'missed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  current_value?: number;

  @Column({ type: 'date', nullable: true })
  completed_at?: Date;

  @Column({ type: 'date', nullable: true })
  due_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
