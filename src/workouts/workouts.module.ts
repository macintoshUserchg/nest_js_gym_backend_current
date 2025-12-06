import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { WorkoutPlan } from '../entities/workout_plans.entity';
import { WorkoutPlanExercise } from '../entities/workout_plan_exercises.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutPlan,
      WorkoutPlanExercise,
      Member,
      Trainer,
      User,
    ]),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
