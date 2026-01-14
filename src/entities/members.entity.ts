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
  Unique,
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
@Unique(['email'])
@Unique(['subscriptionId'])
export class Member {
  @PrimaryGeneratedColumn('increment')
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
  attachmentUrl?: string;

  @Column({ nullable: true })
  emergencyContactName?: string;

  @Column({ nullable: true })
  emergencyContactPhone?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  /**
   * @deprecated Typo - should be freezeMember. Will be fixed in next major version.
   */
  freezMember: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: true, unique: true })
  subscriptionId?: number;

  @Column({ nullable: true })
  branchBranchId?: string;

  @Column({ default: true })
  is_managed_by_member: boolean;

  @OneToOne(() => MemberSubscription, (subscription) => subscription.member, {
    cascade: true,
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription?: MemberSubscription;

  @ManyToOne(() => Branch, (branch) => branch.members, { nullable: true })
  @JoinColumn({ name: 'branchBranchId' })
  branch?: Branch;

  @OneToMany(() => Attendance, (attendance) => attendance.member, { cascade: true })
  attendanceRecords: Attendance[];

  @OneToMany(() => AttendanceGoal, (goal) => goal.member, { cascade: true })
  attendanceGoals: AttendanceGoal[];

  @OneToMany(() => WorkoutPlan, (plan) => plan.member, { cascade: true })
  workoutPlans: WorkoutPlan[];

  @OneToMany(() => DietPlan, (plan) => plan.member, { cascade: true })
  dietPlans: DietPlan[];

  @OneToMany(() => ProgressTracking, (progress) => progress.member, { cascade: true })
  progressRecords: ProgressTracking[];
}
