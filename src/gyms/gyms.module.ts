import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymsService } from './gyms.service';
import { GymsController, BranchesController } from './gyms.controller';
import { BranchAccessGuard } from '../auth/guards/branch-access.guard';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Class } from '../entities/classes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym, Branch, Member, Trainer, Class])],
  controllers: [GymsController, BranchesController],
  providers: [GymsService, BranchAccessGuard],
  exports: [GymsService],
})
export class GymsModule {}
