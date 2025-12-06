import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberSubscription } from './member_subscriptions.entity';
import { Branch } from './branch.entity';
import { Attendance } from './attendance.entity';
import { AttendanceGoal } from './attendance_goals.entity';
import { WorkoutPlan } from './workout_plans.entity';
import { DietPlan } from './diet_plans.entity';
import { ProgressTracking } from './progress_tracking.entity';
import { Gender } from '../common/enums/gender.enum';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  addressLine1?: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  emergencyContactName?: string;

  @Column({ nullable: true })
  emergencyContactPhone?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => MemberSubscription, (subscription) => subscription.member, {
    cascade: true,
  })
  @JoinColumn()
  subscription: MemberSubscription;

  @ManyToOne(() => Branch, (branch) => branch.members, { nullable: true })
  branch?: Branch;

  @OneToMany(() => Attendance, (attendance) => attendance.member)
  attendanceRecords: Attendance[];

  @OneToMany(() => AttendanceGoal, (goal) => goal.member)
  attendanceGoals: AttendanceGoal[];

  @OneToMany(() => WorkoutPlan, (plan) => plan.member)
  workoutPlans: WorkoutPlan[];

  @OneToMany(() => DietPlan, (plan) => plan.member)
  dietPlans: DietPlan[];

  @OneToMany(() => ProgressTracking, (progress) => progress.member)
  progressRecords: ProgressTracking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
