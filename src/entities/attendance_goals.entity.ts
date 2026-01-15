import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Branch } from './branch.entity';

@Entity('attendance_goals')
export class AttendanceGoal {
  @PrimaryGeneratedColumn('uuid')
  goal_id: string;

  @ManyToOne(() => Member, (member) => member.attendanceGoals, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly'] })
  goal_type: string;

  @Column({ type: 'int' })
  target_count: number;

  @Column({ type: 'int', default: 0 })
  current_count: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', default: 0 })
  current_streak: number;

  @Column({ type: 'int', default: 0 })
  longest_streak: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
