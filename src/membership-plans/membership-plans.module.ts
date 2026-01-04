import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlansService } from './membership-plans.service';
import {
  MembershipPlansController,
  BranchMembershipPlansController,
  GymMembershipPlansController,
} from './membership-plans.controller';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Branch } from '../entities/branch.entity';
import { Gym } from '../entities/gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan, Branch, Gym])],
  controllers: [MembershipPlansController, BranchMembershipPlansController, GymMembershipPlansController],
  providers: [MembershipPlansService],
  exports: [MembershipPlansService],
})
export class MembershipPlansModule {}
