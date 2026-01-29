import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { MemberTrainerAssignment } from './member_trainer_assignments.entity';

@Entity('template_assignments')
export class TemplateAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @Column({ type: 'uuid' })
  template_id: string;

  @Column({ type: 'varchar', length: 50 })
  template_type: 'workout' | 'diet';

  @Column({ type: 'int' })
  memberId: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;

  @Column({ type: 'uuid', nullable: true })
  trainer_assignmentId?: string;

  @ManyToOne(() => MemberTrainerAssignment, { nullable: true })
  trainer_assignment?: MemberTrainerAssignment;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  completion_percent: number;

  @Column({ type: 'jsonb', nullable: true })
  member_substitutions?: {
    original_item: string;
    substituted_item: string;
    reason?: string;
    date: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  progress_log?: {
    date: Date;
    action: string;
    details: any;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at?: Date;

  @CreateDateColumn()
  assigned_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
