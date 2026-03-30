import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenewalRequest } from '../entities/renewal_requests.entity';
import { Member } from '../entities/members.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Invoice } from '../entities/invoices.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import {
  RenewalsController,
  MemberRenewalsController,
} from './renewals.controller';
import { RenewalsService } from './renewals.service';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RenewalRequest,
      Member,
      MembershipPlan,
      Invoice,
      MemberSubscription,
    ]),
    RemindersModule,
  ],
  controllers: [RenewalsController, MemberRenewalsController],
  providers: [RenewalsService],
  exports: [RenewalsService],
})
export class RenewalsModule {}
