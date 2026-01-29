import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trainer } from './trainers.entity';

@Entity('goal_templates')
export class GoalTemplate {
  @PrimaryGeneratedColumn('uuid')
  template_id: string;

  @Column({ type: 'int', nullable: true })
  trainerId?: number;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['weekly', 'monthly', 'quarterly'],
  })
  default_schedule_type: string;

  @Column({ type: 'jsonb' })
  default_goals: {
    goal_type: string;
    target_value: number;
    unit: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
