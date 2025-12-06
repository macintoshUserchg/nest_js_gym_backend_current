import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';

@Entity('progress_tracking')
export class ProgressTracking {
  @PrimaryGeneratedColumn('uuid')
  progress_id: string;

  @ManyToOne(() => Member, (member) => member.progressRecords)
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  recorded_by_trainer?: Trainer;

  @Column({ type: 'date' })
  record_date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  body_fat_percentage?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscle_mass_kg?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest_cm?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist_cm?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  arms_cm?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  thighs_cm?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  achievements?: string;

  @Column({ type: 'text', nullable: true })
  photo_url?: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
