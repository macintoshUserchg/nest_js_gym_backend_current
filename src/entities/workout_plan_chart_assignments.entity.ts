import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutTemplate } from './workout_templates.entity';
import { Member } from './members.entity';
import { MemberTrainerAssignment } from './member_trainer_assignments.entity';
import { User } from './users.entity';

export enum ChartAssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

@Entity('workout_plan_chart_assignments')
export class WorkoutPlanChartAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => WorkoutTemplate, { onDelete: 'CASCADE' })
  chart: WorkoutTemplate;

  @Column({ type: 'uuid' })
  chart_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;

  @Column({ type: 'int' })
  memberId: number;

  @ManyToOne(() => MemberTrainerAssignment, { nullable: true })
  trainer_assignment?: MemberTrainerAssignment;

  @Column({ type: 'uuid', nullable: true })
  trainer_assignment_id?: string;

  @ManyToOne(() => User)
  assigned_by: User;

  @Column({ type: 'uuid' })
  assigned_by_user_id: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({
    type: 'enum',
    enum: ChartAssignmentStatus,
    default: ChartAssignmentStatus.ACTIVE,
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  completion_percent: number;

  @Column({ type: 'jsonb', nullable: true })
  customizations?: {
    skipped_exercises: string[];
    modified_sets: { exercise_name: string; sets: number }[];
    modified_reps: { exercise_name: string; reps: string }[];
    notes: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  member_substitutions?: {
    original_exercise: string;
    substituted_exercise: string;
    reason?: string;
    date: Date;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date;

  @CreateDateColumn()
  assigned_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
