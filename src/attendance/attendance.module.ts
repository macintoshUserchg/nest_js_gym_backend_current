import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import {
  AttendanceController,
  MemberAttendanceController,
  TrainerAttendanceController,
  BranchAttendanceController,
} from './attendance.controller';
import { Attendance } from '../entities/attendance.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Member, Trainer, Branch])],
  controllers: [
    AttendanceController,
    MemberAttendanceController,
    TrainerAttendanceController,
    BranchAttendanceController,
  ],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
