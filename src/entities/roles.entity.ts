import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './users.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., "SUPERADMIN", "ADMIN", "TRAINER", "MEMBER"

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => User, user => user.role)
  users: User[];
}
