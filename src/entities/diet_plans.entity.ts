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
import { DietPlanMeal } from './diet_plan_meals.entity';

@Entity('diet_plans')
export class DietPlan {
  @PrimaryGeneratedColumn('uuid')
  plan_id: string;

  @ManyToOne(() => Member, (member) => member.dietPlans, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  assigned_by_trainer?: Trainer;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking'],
  })
  goal_type: string;

  @Column({ type: 'int', default: 0 })
  target_calories: number;

  @Column({ type: 'int', nullable: true })
  target_protein?: number;

  @Column({ type: 'int', nullable: true })
  target_carbs?: number;

  @Column({ type: 'int', nullable: true })
  target_fat?: number;

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

  // Template fields
  @Column({ type: 'uuid', nullable: true })
  template_id?: string;

  @Column({ default: false })
  is_template: boolean;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'uuid', nullable: true })
  parent_template_id?: string;

  @Column({ type: 'int', default: 0 })
  version: number;

  @OneToMany(() => DietPlanMeal, (meal) => meal.dietPlan)
  meals: DietPlanMeal[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
