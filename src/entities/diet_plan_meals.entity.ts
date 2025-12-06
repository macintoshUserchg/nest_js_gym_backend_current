import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DietPlan } from './diet_plans.entity';

@Entity('diet_plan_meals')
export class DietPlanMeal {
  @PrimaryGeneratedColumn('uuid')
  meal_id: string;

  @ManyToOne(() => DietPlan, (plan) => plan.meals)
  dietPlan: DietPlan;

  @Column({
    type: 'enum',
    enum: [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'pre_workout',
      'post_workout',
    ],
  })
  meal_type: string;

  @Column({ length: 100 })
  meal_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  ingredients?: string;

  @Column({ type: 'text', nullable: true })
  preparation?: string;

  @Column({ type: 'int', nullable: true })
  calories?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  protein_g?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  carbs_g?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fat_g?: number;

  @Column({ type: 'int', default: 1 })
  day_of_week: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
