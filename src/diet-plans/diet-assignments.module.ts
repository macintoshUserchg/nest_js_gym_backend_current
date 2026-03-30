import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietPlanAssignment } from '../entities/diet_plan_assignments.entity';
import { DietPlan } from '../entities/diet_plans.entity';
import { Member } from '../entities/members.entity';
import { DietPlanAssignmentsController } from './diet-assignments.controller';
import { DietPlanAssignmentsService } from './diet-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([DietPlanAssignment, DietPlan, Member])],
  controllers: [DietPlanAssignmentsController],
  providers: [DietPlanAssignmentsService],
  exports: [DietPlanAssignmentsService],
})
export class DietPlanAssignmentsModule {}
