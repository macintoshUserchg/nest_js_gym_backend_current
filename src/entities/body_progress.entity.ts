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

@Entity('body_progress')
export class BodyProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, { nullable: false })
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  body_fat?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi?: number;

  @Column({ type: 'jsonb', nullable: true })
  measurements?: any;

  @Column({ type: 'jsonb', nullable: true })
  progress_photos?: any;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
