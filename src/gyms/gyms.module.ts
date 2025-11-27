import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymsService } from './gyms.service';
import { GymsController, BranchesController } from './gyms.controller';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym, Branch])],
  controllers: [GymsController, BranchesController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
