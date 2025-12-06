import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';
import { AttendanceGoal } from '../entities/attendance_goals.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { CreateAttendanceGoalDto } from './dto/create-attendance-goal.dto';
import { MonthlyAttendanceDto } from './dto/monthly-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(AttendanceGoal)
    private goalsRepo: Repository<AttendanceGoal>,
  ) {}

  async markAttendance(dto: MarkAttendanceDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        date: today,
        branch: { branchId: dto.branchId },
        ...(dto.memberId ? { member: { id: dto.memberId } } : {}),
        ...(dto.trainerId ? { trainer: { id: dto.trainerId } } : {}),
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Already checked in today');
    }

    // Get branch
    const branch = await this.branchesRepo.findOne({
      where: { branchId: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
    }

    let member: Member | null = null;
    let trainer: Trainer | null = null;

    if (dto.memberId) {
      member = await this.membersRepo.findOne({
        where: { id: dto.memberId },
      });
      if (!member) {
        throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
      }
    }

    if (dto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: dto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${dto.trainerId} not found`,
        );
      }
    }

    const attendance = this.attendanceRepo.create({
      ...(member && { member }),
      ...(trainer && { trainer }),
      branch,
      attendanceType: dto.memberId ? 'member' : 'trainer',
      checkInTime: new Date(),
      date: today,
      notes: dto.notes,
    });

    const savedAttendance = await this.attendanceRepo.save(attendance);

    // Update attendance goals if member
    if (member) {
      await this.updateAttendanceGoals(member.id);
    }

    return savedAttendance;
  }

  async checkOut(id: string) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out');
    }

    attendance.checkOutTime = new Date();
    return this.attendanceRepo.save(attendance);
  }

  async findAll() {
    return this.attendanceRepo.find({
      relations: ['member', 'trainer', 'branch'],
    });
  }

  async findOne(id: string) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['member', 'trainer', 'branch'],
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }

  async findByMember(memberId: number) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.attendanceRepo.find({
      where: { member: { id: memberId } },
      relations: ['branch'],
      order: { checkInTime: 'DESC' },
    });
  }

  async findByTrainer(trainerId: number) {
    const trainer = await this.trainersRepo.findOne({
      where: { id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    return this.attendanceRepo.find({
      where: { trainer: { id: trainerId } },
      relations: ['branch'],
      order: { checkInTime: 'DESC' },
    });
  }

  async findByBranch(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.attendanceRepo.find({
      where: { branch: { branchId } },
      relations: ['member', 'trainer'],
      order: { checkInTime: 'DESC' },
    });
  }

  async createAttendanceGoal(createGoalDto: CreateAttendanceGoalDto) {
    const member = await this.membersRepo.findOne({
      where: { id: createGoalDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createGoalDto.memberId} not found`,
      );
    }

    let branch: Branch | undefined = undefined;
    if (createGoalDto.branchId) {
      const branchResult = await this.branchesRepo.findOne({
        where: { branchId: createGoalDto.branchId },
      });
      if (!branchResult) {
        throw new NotFoundException(
          `Branch with ID ${createGoalDto.branchId} not found`,
        );
      }
      branch = branchResult;
    }

    const goal = this.goalsRepo.create({
      member,
      branch,
      goal_type: createGoalDto.goalType,
      target_count: createGoalDto.targetCount,
      start_date: createGoalDto.startDate,
      end_date: createGoalDto.endDate,
    });

    return this.goalsRepo.save(goal);
  }

  async getMonthlyAttendance(monthlyDto: MonthlyAttendanceDto) {
    const member = await this.membersRepo.findOne({
      where: { id: monthlyDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${monthlyDto.memberId} not found`,
      );
    }

    const startDate = new Date(monthlyDto.year, monthlyDto.month - 1, 1);
    const endDate = new Date(monthlyDto.year, monthlyDto.month, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await this.attendanceRepo.find({
      where: {
        member: { id: monthlyDto.memberId },
        date: Between(startDate, endDate),
        ...(monthlyDto.branchId
          ? { branch: { branchId: monthlyDto.branchId } }
          : {}),
      },
      select: ['date', 'checkInTime'],
      order: { date: 'ASC' },
    });

    // Create calendar data
    const calendarData: Array<{
      date: string;
      attended: boolean;
      checkInTime: Date | null;
    }> = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const attendance = attendanceRecords.find(
        (a) => a.date.toISOString().split('T')[0] === dateStr,
      );

      calendarData.push({
        date: dateStr,
        attended: !!attendance,
        checkInTime: attendance ? attendance.checkInTime : null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      member: {
        id: member.id,
        fullName: member.fullName,
      },
      year: monthlyDto.year,
      month: monthlyDto.month,
      totalDays: calendarData.length,
      attendedDays: calendarData.filter((day) => day.attended).length,
      calendar: calendarData,
    };
  }

  async getAttendanceStreaks(memberId: number) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get attendance for last 90 days
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90);

    const attendanceRecords = await this.attendanceRepo.find({
      where: {
        member: { id: memberId },
        date: MoreThanOrEqual(startDate),
      },
      select: ['date'],
      order: { date: 'ASC' },
    });

    const attendedDates = attendanceRecords.map(
      (a) => a.date.toISOString().split('T')[0],
    );

    // Calculate current streak
    let currentStreak = 0;
    const dateToCheck = new Date(today);
    while (attendedDates.includes(dateToCheck.toISOString().split('T')[0])) {
      currentStreak++;
      dateToCheck.setDate(dateToCheck.getDate() - 1);
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of attendedDates) {
      const currentDate = new Date(dateStr);
      if (
        !previousDate ||
        currentDate.getTime() - previousDate.getTime() === 86400000
      ) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      previousDate = currentDate;
    }

    return {
      member: {
        id: member.id,
        fullName: member.fullName,
      },
      currentStreak,
      longestStreak,
      lastAttendance:
        attendanceRecords.length > 0
          ? attendanceRecords[attendanceRecords.length - 1].date
          : null,
    };
  }

  private async updateAttendanceGoals(memberId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeGoals = await this.goalsRepo.find({
      where: {
        member: { id: memberId },
        is_active: true,
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      },
    });

    for (const goal of activeGoals) {
      // Count attendance for the goal period
      const attendanceCount = await this.attendanceRepo.count({
        where: {
          member: { id: memberId },
          date: Between(goal.start_date, goal.end_date),
        },
      });

      goal.current_count = attendanceCount;

      // Update streaks if daily goal
      if (goal.goal_type === 'daily') {
        const yesterday = new Date(today);
        yesterday.setHours(0, 0, 0, 0);

        const yesterdayAttendance = await this.attendanceRepo.findOne({
          where: {
            member: { id: memberId },
            date: yesterday,
          },
        });

        if (yesterdayAttendance) {
          goal.current_streak += 1;
          goal.longest_streak = Math.max(
            goal.longest_streak,
            goal.current_streak,
          );
        } else {
          goal.current_streak = 1;
        }
      }

      await this.goalsRepo.save(goal);
    }
  }
}
