import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './members.entity';
import { User } from './users.entity';

@Entity('diets')
export class Diet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, { nullable: false })
  member: Member;

  @ManyToOne(() => User, { nullable: true })
  assigned_by: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calories?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  protein?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbs?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fat?: number;

  @Column({ type: 'jsonb', nullable: true })
  meals?: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
