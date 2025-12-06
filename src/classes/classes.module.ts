import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import {
  ClassesController,
  BranchClassesController,
} from './classes.controller';
import { Class } from '../entities/classes.entity';
import { Branch } from '../entities/branch.entity';
import { Trainer } from '../entities/trainers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Branch, Trainer])],
  controllers: [ClassesController, BranchClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
