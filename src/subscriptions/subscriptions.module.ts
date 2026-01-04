import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionsController,
  MemberSubscriptionsController,
} from './subscriptions.controller';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Member } from '../entities/members.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Class } from '../entities/classes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberSubscription,
      Member,
      MembershipPlan,
      Class,
    ]),
  ],
  controllers: [SubscriptionsController, MemberSubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
