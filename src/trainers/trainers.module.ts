import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainersService } from './trainers.service';
import {
  TrainersController,
  BranchTrainersController,
} from './trainers.controller';
import { BranchAccessGuard } from '../auth/guards/branch-access.guard';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer, Branch, User, Role])],
  controllers: [TrainersController, BranchTrainersController],
  providers: [TrainersService, BranchAccessGuard],
  exports: [TrainersService],
})
export class TrainersModule {}
