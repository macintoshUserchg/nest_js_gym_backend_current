import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DietPlan } from './diet_plans.entity';
import { Member } from './members.entity';
import { User } from './users.entity';

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

@Entity('diet_plan_assignments')
export class DietPlanAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => DietPlan, { onDelete: 'CASCADE' })
  diet_plan: DietPlan;

  @Column({ type: 'uuid' })
  diet_plan_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;

  @Column({ type: 'int' })
  memberId: number;

  @ManyToOne(() => User)
  assigned_by: User;

  @Column({ type: 'int' })
  assigned_by_user_id: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  completion_percent: number;

  @Column({ type: 'jsonb', nullable: true })
  member_substitutions?: {
    original_meal: string;
    substituted_meal: string;
    reason?: string;
    date: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  progress_log?: {
    date: Date;
    action: string;
    details: any;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date;

  @CreateDateColumn()
  assigned_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
