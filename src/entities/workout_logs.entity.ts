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

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, { nullable: false })
  member: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @Column({ length: 200 })
  exercise_name: string;

  @Column({ type: 'int', nullable: true })
  sets?: number;

  @Column({ type: 'int', nullable: true })
  reps?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
