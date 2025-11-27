import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import {
  AssignmentsController,
  MemberAssignmentsController,
  TrainerAssignmentsController,
} from './assignments.controller';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberTrainerAssignment, Member, Trainer])],
  controllers: [
    AssignmentsController,
    MemberAssignmentsController,
    TrainerAssignmentsController,
  ],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
