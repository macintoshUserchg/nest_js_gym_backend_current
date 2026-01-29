import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlanChartAssignmentsService } from './workout-plan-chart-assignments.service';
import { WorkoutPlanChartAssignmentsController } from './workout-plan-chart-assignments.controller';
import { WorkoutPlanChartAssignment } from '../entities/workout_plan_chart_assignments.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutPlanChartAssignment,
      WorkoutTemplate,
      Member,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [WorkoutPlanChartAssignmentsController],
  providers: [WorkoutPlanChartAssignmentsService],
  exports: [WorkoutPlanChartAssignmentsService],
})
export class WorkoutPlanChartAssignmentsModule {}
