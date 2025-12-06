import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  log_id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  action: string;

  @Column()
  entity_type: string;

  @Column()
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  previous_values: any;

  @Column({ type: 'jsonb', nullable: true })
  new_values: any;

  @CreateDateColumn()
  timestamp: Date;
}
