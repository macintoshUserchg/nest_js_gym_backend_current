import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Gym } from './gym.entity';
import { User } from './users.entity';
import { Class } from './classes.entity';
import { Member } from './members.entity';
import { Trainer } from './trainers.entity';
import { Inquiry } from './inquiry.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  branchId: string;

  @ManyToOne(() => Gym, (gym) => gym.branches, { onDelete: 'CASCADE' })
  gym: Gym;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ default: false })
  mainBranch: boolean;

  // ---- USERS ----
  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  // ---- MEMBERS ----
  @OneToMany(() => Member, (member) => member.branch)
  members: Member[];

  // ---- TRAINERS ----
  @OneToMany(() => Trainer, (trainer) => trainer.branch)
  trainers: Trainer[];

  // ---- CLASSES ----
  @OneToMany(() => Class, (cls) => cls.branch)
  classes: Class[];

  // ---- INQUIRIES ----
  @OneToMany(() => Inquiry, (inquiry) => inquiry.branch)
  inquiries: Inquiry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
