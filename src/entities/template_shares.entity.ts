import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Trainer } from './trainers.entity';
import { User } from './users.entity';

@Entity('template_shares')
export class TemplateShare {
  @PrimaryGeneratedColumn('uuid')
  share_id: string;

  @Column({ type: 'uuid' })
  template_id: string;

  @Column({ type: 'varchar', length: 50 })
  template_type: 'workout' | 'diet' | 'goal';

  @Column({ type: 'int', nullable: true })
  shared_with_trainerId?: number;

  @ManyToOne(() => Trainer)
  shared_with_trainer: Trainer;

  @ManyToOne(() => User)
  shared_by_admin: User;

  @Column({ type: 'text', nullable: true })
  admin_note?: string;

  @Column({ default: false })
  is_accepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at?: Date;

  @CreateDateColumn()
  shared_at: Date;
}
