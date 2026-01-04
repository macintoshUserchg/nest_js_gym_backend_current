import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import {
  MembersController,
  BranchMembersController,
} from './members.controller';
import { Member } from '../entities/members.entity';
import { Branch } from '../entities/branch.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';
import { Attendance } from '../entities/attendance.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Branch,
      User,
      Role,
      Attendance,
      PaymentTransaction,
      MemberSubscription,
      MembershipPlan,
    ]),
  ],
  controllers: [MembersController, BranchMembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
