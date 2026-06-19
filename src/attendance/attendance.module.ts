import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import {
  AttendanceController,
  MemberAttendanceController,
  TrainerAttendanceController,
  BranchAttendanceController,
} from './attendance.controller';
import { BranchAccessGuard } from '../auth/guards/branch-access.guard';
import { Attendance } from '../entities/attendance.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';
import { AttendanceGoal } from '../entities/attendance_goals.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      Member,
      Trainer,
      Branch,
      AttendanceGoal,
    ]),
  ],
  controllers: [
    AttendanceController,
    MemberAttendanceController,
    TrainerAttendanceController,
    BranchAttendanceController,
  ],
  providers: [AttendanceService, BranchAccessGuard],
  exports: [AttendanceService],
})
export class AttendanceModule {}
