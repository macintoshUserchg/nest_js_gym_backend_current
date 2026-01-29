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
import { GoalSchedule } from './entities/goal_schedules.entity';
import { GoalTemplate } from './entities/goal_templates.entity';
import { WorkoutTemplate } from './entities/workout_templates.entity';
import { WorkoutTemplateExercise } from './entities/workout_template_exercises.entity';
import { DietTemplate } from './entities/diet_templates.entity';
import { DietTemplateMeal } from './entities/diet_template_meals.entity';
import { TemplateShare } from './entities/template_shares.entity';
import { TemplateAssignment } from './entities/template_assignments.entity';
import { MemberTrainerAssignment } from './entities/member_trainer_assignments.entity';
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
import { DietPlansModule } from './diet-plans/diet-plans.module';
import { WorkoutLogsModule } from './workout-logs/workout-logs.module';
import { BodyProgressModule } from './body-progress/body-progress.module';
import { GoalsModule } from './goals/goals.module';
import { WorkoutTemplatesModule } from './workouts/workout-templates.module';
import { DietTemplatesModule } from './diet-plans/diet-templates.module';
import { GoalTemplatesModule } from './goals/goal-templates.module';
import { TemplateAssignmentsModule } from './templates/template-assignments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DietPlanAssignment } from './entities/diet_plan_assignments.entity';
import { DietPlanAssignmentsModule } from './diet-plans/diet-assignments.module';
import { WorkoutPlanChartAssignment } from './entities/workout_plan_chart_assignments.entity';
import { WorkoutPlanChartAssignmentsModule } from './workouts/workout-plan-chart-assignments.module';

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
      GoalSchedule,
      GoalTemplate,
      WorkoutTemplate,
      WorkoutTemplateExercise,
      DietTemplate,
      DietTemplateMeal,
      TemplateShare,
      TemplateAssignment,
      MemberTrainerAssignment,
      DietPlanAssignment,
      WorkoutPlanChartAssignment,
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
    DietPlansModule,
    WorkoutLogsModule,
    BodyProgressModule,
    GoalsModule,
    WorkoutTemplatesModule,
    DietTemplatesModule,
    GoalTemplatesModule,
    TemplateAssignmentsModule,
    NotificationsModule,
    DietPlanAssignmentsModule,
    WorkoutPlanChartAssignmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
