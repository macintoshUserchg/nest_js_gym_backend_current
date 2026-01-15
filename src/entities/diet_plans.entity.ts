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

  @OneToMany(() => DietPlanMeal, (meal) => meal.dietPlan)
  meals: DietPlanMeal[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
