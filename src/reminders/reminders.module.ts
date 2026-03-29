import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderLog } from '../entities/reminder_logs.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Invoice } from '../entities/invoices.entity';
import { RenewalRequest } from '../entities/renewal_requests.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersService } from './reminders.service';
import { MembersRemindersController } from './reminders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReminderLog,
      Member,
      User,
      MemberSubscription,
      Invoice,
      RenewalRequest,
    ]),
    NotificationsModule,
  ],
  providers: [RemindersService],
  controllers: [MembersRemindersController],
  exports: [RemindersService],
})
export class RemindersModule {}
