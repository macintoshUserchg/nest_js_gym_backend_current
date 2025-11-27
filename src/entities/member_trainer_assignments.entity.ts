import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn , CreateDateColumn } from 'typeorm';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';

@Entity('member_trainer_assignments')
export class MemberTrainerAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Trainer)
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'enum', enum: ['active', 'ended'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
