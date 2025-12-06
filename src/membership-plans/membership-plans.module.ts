import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlansService } from './membership-plans.service';
import {
  MembershipPlansController,
  BranchMembershipPlansController,
} from './membership-plans.controller';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Branch } from '../entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan, Branch])],
  controllers: [MembershipPlansController, BranchMembershipPlansController],
  providers: [MembershipPlansService],
  exports: [MembershipPlansService],
})
export class MembershipPlansModule {}
