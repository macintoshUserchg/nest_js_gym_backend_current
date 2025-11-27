import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Branch } from './branch.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  class_id: string;

  @ManyToOne(() => Branch, b => b.classes)
  branch: Branch;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['morning', 'evening', 'both', 'either'], nullable: true })
  timings?: string;

  // Recurrence fields
  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly'], nullable: true })
  recurrence_type: string;

  @Column({ type: 'int', array: true, nullable: true })
  days_of_week: number[];

}
