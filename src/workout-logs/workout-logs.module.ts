import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLogsController } from './workout-logs.controller';
import { WorkoutLogsService } from './workout-logs.service';
import { WorkoutLog } from '../entities/workout_logs.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLog, Member, Trainer, User, Role]),
  ],
  controllers: [WorkoutLogsController],
  providers: [WorkoutLogsService],
  exports: [WorkoutLogsService],
})
export class WorkoutLogsModule {}
