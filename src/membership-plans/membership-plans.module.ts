import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlansService } from './membership-plans.service';
import {
  MembershipPlansController,
  BranchMembershipPlansController,
  GymMembershipPlansController,
} from './membership-plans.controller';
import { BranchAccessGuard } from '../auth/guards/branch-access.guard';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Branch } from '../entities/branch.entity';
import { Gym } from '../entities/gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan, Branch, Gym])],
  controllers: [
    MembershipPlansController,
    BranchMembershipPlansController,
    GymMembershipPlansController,
  ],
  providers: [MembershipPlansService, BranchAccessGuard],
  exports: [MembershipPlansService],
})
export class MembershipPlansModule {}
