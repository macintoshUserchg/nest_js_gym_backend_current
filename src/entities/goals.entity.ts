import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @Column({ length: 100 })
  goal_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  target_value?: number;

  @Column({ type: 'date', nullable: true })
  target_timeline?: Date;

  @Column({ type: 'jsonb', nullable: true })
  milestone?: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percent: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
