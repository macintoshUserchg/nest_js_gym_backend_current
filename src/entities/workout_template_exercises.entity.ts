import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutTemplate } from './workout_templates.entity';

export enum EquipmentRequired {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  CABLE = 'CABLE',
  MACHINE = 'MACHINE',
  BODYWEIGHT = 'BODYWEIGHT',
  KETTLEBELL = 'KETTLEBELL',
  MEDICINE_BALL = 'MEDICINE_BALL',
  RESISTANCE_BAND = 'RESISTANCE_BAND',
  OTHER = 'OTHER',
}

@Entity('workout_template_exercises')
export class WorkoutTemplateExercise {
  @PrimaryGeneratedColumn('uuid')
  exercise_id: string;

  @ManyToOne(() => WorkoutTemplate, (template) => template.exercises, {
    onDelete: 'CASCADE',
  })
  template: WorkoutTemplate;

  @Column({ length: 100 })
  exercise_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['sets_reps', 'time', 'distance'],
  })
  exercise_type: string;

  @Column({
    type: 'enum',
    enum: EquipmentRequired,
    nullable: true,
  })
  equipment_required?: string;

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

  @Column({ type: 'int', nullable: true })
  order_index?: number;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ type: 'text', nullable: true })
  alternatives?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  member_can_skip: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
