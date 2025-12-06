import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressTrackingController } from './progress-tracking.controller';
import { ProgressTrackingService } from './progress-tracking.service';
import { ProgressTracking } from '../entities/progress_tracking.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgressTracking, Member, Trainer, User]),
  ],
  controllers: [ProgressTrackingController],
  providers: [ProgressTrackingService],
  exports: [ProgressTrackingService],
})
export class ProgressTrackingModule {}
