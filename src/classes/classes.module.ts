import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import {
  ClassesController,
  BranchClassesController,
  GymClassesController,
} from './classes.controller';
import { Class } from '../entities/classes.entity';
import { Branch } from '../entities/branch.entity';
import { Trainer } from '../entities/trainers.entity';
import { Gym } from '../entities/gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Branch, Trainer, Gym])],
  controllers: [
    ClassesController,
    BranchClassesController,
    GymClassesController,
  ],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
