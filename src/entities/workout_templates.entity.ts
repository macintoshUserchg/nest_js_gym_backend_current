import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trainer } from './trainers.entity';
import { Branch } from './branch.entity';
import { WorkoutTemplateExercise } from './workout_template_exercises.entity';

export enum ChartVisibility {
  PRIVATE = 'PRIVATE',
  GYM_PUBLIC = 'GYM_PUBLIC',
}

export enum ChartType {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  HIIT = 'HIIT',
  FLEXIBILITY = 'FLEXIBILITY',
  COMPOUND = 'COMPOUND',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum PlanType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  ENDURANCE = 'endurance',
  GENERAL = 'general',
}

@Entity('workout_templates')
export class WorkoutTemplate {
  @PrimaryGeneratedColumn('uuid')
  template_id: string;

  @Column({ type: 'int', nullable: true })
  trainerId?: number;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ChartVisibility,
    default: ChartVisibility.PRIVATE,
  })
  visibility: string;

  @Column({
    type: 'enum',
    enum: ChartType,
  })
  chart_type: string;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty_level: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.GENERAL,
  })
  plan_type: string;

  @Column({ type: 'int', default: 0 })
  duration_days: number;

  @Column({ default: false })
  is_shared_gym: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  parent_template_id?: string;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  avg_rating?: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @OneToMany(() => WorkoutTemplateExercise, (exercise) => exercise.template)
  exercises: WorkoutTemplateExercise[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
