import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalSchedule } from '../entities/goal_schedules.entity';
import { GoalTemplate } from '../entities/goal_templates.entity';
import { GoalSchedulesController } from './goal-schedules.controller';
import { GoalSchedulesService } from './goal-schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([GoalSchedule, GoalTemplate])],
  controllers: [GoalSchedulesController],
  providers: [GoalSchedulesService],
  exports: [GoalSchedulesService],
})
export class GoalSchedulesModule {}
