import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Branch } from './branch.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @ManyToOne(() => Branch, branch => branch.trainers)
  branch: Branch;
}
