import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { User } from './users.entity';

@Entity('gyms')
export class Gym {
  @PrimaryGeneratedColumn('uuid')
  gymId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true, unique: true })
  email?: string;

  @Column({ length: 15, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  state?: string;

  @OneToMany(() => Branch, (branch) => branch.gym)
  branches: Branch[];

  @OneToMany(() => User, (user) => user.gym)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
