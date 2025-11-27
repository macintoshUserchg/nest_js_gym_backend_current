import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pgConfig } from '../dbConfig';
import { ConfigModule } from '@nestjs/config';
import { Gym } from './entities/gym.entity';
import { User } from './entities/users.entity';
import { Branch } from './entities/branch.entity';
import { Class } from './entities/classes.entity';
import { Member } from './entities/members.entity';
import { Trainer } from './entities/trainers.entity';
import { Attendance } from './entities/attendance.entity';
import { AuditLog } from './entities/audit_logs.entity';
import { Inquiry } from './entities/inquiry.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GymsModule } from './gyms/gyms.module';
import { MembersModule } from './members/members.module';
import { MembershipPlansModule } from './membership-plans/membership-plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ClassesModule } from './classes/classes.module';
import { TrainersModule } from './trainers/trainers.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RolesModule } from './roles/roles.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { InquiriesModule } from './inquiries/inquiries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(pgConfig),
    TypeOrmModule.forFeature([
      Gym,
      User,
      Branch,
      Class,
      Member,
      Trainer,
      Attendance,
      AuditLog,
      Inquiry,
    ]),
    AuthModule,
    UsersModule,
    GymsModule,
    MembersModule,
    MembershipPlansModule,
    SubscriptionsModule,
    ClassesModule,
    TrainersModule,
    AssignmentsModule,
    AttendanceModule,
    AuditLogsModule,
    AnalyticsModule,
    RolesModule,
    InvoicesModule,
    PaymentsModule,
    InquiriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
