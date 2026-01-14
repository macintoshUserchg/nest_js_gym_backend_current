import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';
import { Branch } from './branch.entity';
import { WorkoutPlanExercise } from './workout_plan_exercises.entity';

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  plan_id: string;

  @ManyToOne(() => Member, (member) => member.workoutPlans, { onDelete: 'CASCADE' })
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  assigned_by_trainer?: Trainer;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty_level: string;

  @Column({
    type: 'enum',
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'],
  })
  plan_type: string;

  @Column({ type: 'int', default: 0 })
  duration_days: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => WorkoutPlanExercise, (exercise) => exercise.workoutPlan)
  exercises: WorkoutPlanExercise[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
