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
import { DietTemplateMeal } from './diet_template_meals.entity';

@Entity('diet_templates')
export class DietTemplate {
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
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'cutting', 'bulking', 'custom'],
  })
  goal_type: string;

  @Column({ type: 'int', default: 0 })
  target_calories: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  protein_g?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  carbs_g?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fat_g?: number;

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

  @OneToMany(() => DietTemplateMeal, (meal) => meal.template)
  meals: DietTemplateMeal[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
