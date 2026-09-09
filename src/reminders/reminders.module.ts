import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderLog } from '../entities/reminder_logs.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Invoice } from '../entities/invoices.entity';
import { RenewalRequest } from '../entities/renewal_requests.entity';
import { NotificationPreference } from '../entities/notification_preferences.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SMSService } from '../notifications/sms.service';
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
      NotificationPreference,
    ]),
    NotificationsModule,
  ],
  providers: [RemindersService, SMSService],
  controllers: [MembersRemindersController],
  exports: [RemindersService],
})
export class RemindersModule {}
