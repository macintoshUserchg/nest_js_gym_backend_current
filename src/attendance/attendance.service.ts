import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { Branch } from '../entities/branch.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

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
  ) {}

  async markAttendance(dto: MarkAttendanceDto) {
    // Validate that exactly one of memberId or trainerId is provided
    if (!dto.memberId && !dto.trainerId) {
      throw new BadRequestException('Either memberId or trainerId must be provided');
    }
    if (dto.memberId && dto.trainerId) {
      throw new BadRequestException('Cannot provide both memberId and trainerId');
    }

    const branch = await this.branchesRepo.findOne({
      where: { branchId: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
    }

    let member: Member | undefined;
    let trainer: Trainer | undefined;
    let attendanceType: string;

    if (dto.memberId) {
      const foundMember = await this.membersRepo.findOne({
        where: { id: dto.memberId },
      });
      if (!foundMember) {
        throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
      }
      member = foundMember;
      attendanceType = 'member';
    } else {
      const foundTrainer = await this.trainersRepo.findOne({
        where: { id: dto.trainerId },
      });
      if (!foundTrainer) {
        throw new NotFoundException(`Trainer with ID ${dto.trainerId} not found`);
      }
      trainer = foundTrainer;
      attendanceType = 'trainer';
    }

    const now = new Date();
    const attendance = this.attendanceRepo.create({
      member,
      trainer,
      branch,
      attendanceType,
      checkInTime: now,
      date: new Date(now.toDateString()),
      notes: dto.notes,
    });

    return this.attendanceRepo.save(attendance);
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
      order: { checkInTime: 'DESC' },
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
      relations: ['member', 'branch'],
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
      relations: ['trainer', 'branch'],
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
      relations: ['member', 'trainer', 'branch'],
      order: { checkInTime: 'DESC' },
    });
  }
}
