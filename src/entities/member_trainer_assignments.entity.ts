import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';

@Entity('member_trainer_assignments')
export class MemberTrainerAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Trainer)
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({ type: 'enum', enum: ['active', 'ended'], default: 'active' })
  status: string;

  // Template assignment fields
  @Column({ type: 'uuid', nullable: true })
  assigned_workout_template_id?: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_diet_template_id?: string;

  @Column({ type: 'date', nullable: true })
  workout_start_date?: Date;

  @Column({ type: 'date', nullable: true })
  workout_end_date?: Date;

  @Column({ type: 'date', nullable: true })
  diet_start_date?: Date;

  @Column({ type: 'date', nullable: true })
  diet_end_date?: Date;

  @Column({ default: true })
  auto_apply_templates: boolean;

  @Column({ default: true })
  allow_member_substitutions: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
