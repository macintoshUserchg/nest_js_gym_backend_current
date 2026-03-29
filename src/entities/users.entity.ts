import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Gym } from './gym.entity';
import { Branch } from './branch.entity';
import { Role } from './roles.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ManyToOne(() => Gym, (gym) => gym.users, { nullable: true })
  gym?: Gym;

  @ManyToOne(() => Branch, (branch) => branch.users, { nullable: true })
  branch?: Branch;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false, eager: true })
  role: Role;

  @Column({ nullable: true })
  memberId?: string;

  @Column({ nullable: true })
  trainerId?: string;

  @Column({ nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
