import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutPlan } from './workout_plans.entity';

@Entity('workout_plan_exercises')
export class WorkoutPlanExercise {
  @PrimaryGeneratedColumn('uuid')
  exercise_id: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.exercises, {
    onDelete: 'CASCADE',
  })
  workoutPlan: WorkoutPlan;

  @Column({ length: 100 })
  exercise_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['sets_reps', 'time', 'distance'] })
  exercise_type: string;

  @Column({ type: 'int', nullable: true })
  sets?: number;

  @Column({ type: 'int', nullable: true })
  reps?: number;

  @Column({ type: 'int', nullable: true })
  weight_kg?: number;

  @Column({ type: 'int', nullable: true })
  duration_minutes?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  distance_km?: number;

  @Column({ type: 'int', default: 1 })
  day_of_week: number;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
