import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';
import { Branch } from './branch.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member, { nullable: true, onDelete: 'CASCADE' })
  member?: Member;

  @ManyToOne(() => Trainer, { nullable: true })
  trainer?: Trainer;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'enum', enum: ['member', 'trainer'] })
  attendanceType: string;

  @Column({ type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime?: Date;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
