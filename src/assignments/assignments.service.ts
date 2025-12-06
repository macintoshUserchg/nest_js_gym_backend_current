import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(MemberTrainerAssignment)
    private assignmentsRepo: Repository<MemberTrainerAssignment>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
  ) {}

  async create(createDto: CreateAssignmentDto) {
    const member = await this.membersRepo.findOne({
      where: { id: createDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createDto.memberId} not found`,
      );
    }

    const trainer = await this.trainersRepo.findOne({
      where: { id: createDto.trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(
        `Trainer with ID ${createDto.trainerId} not found`,
      );
    }

    const assignmentData: any = {
      member,
      trainer,
      start_date: new Date(createDto.startDate),
      status: createDto.status || 'active',
    };

    if (createDto.endDate) {
      assignmentData.end_date = new Date(createDto.endDate);
    }

    const assignment = this.assignmentsRepo.create(assignmentData);

    return this.assignmentsRepo.save(assignment);
  }

  async findAll() {
    return this.assignmentsRepo.find({
      relations: ['member', 'trainer'],
    });
  }

  async findOne(id: string) {
    const assignment = await this.assignmentsRepo.findOne({
      where: { assignment_id: id },
      relations: ['member', 'trainer'],
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async findByMember(memberId: number) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.assignmentsRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'trainer'],
    });
  }

  async findByTrainer(trainerId: number) {
    const trainer = await this.trainersRepo.findOne({
      where: { id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    return this.assignmentsRepo.find({
      where: { trainer: { id: trainerId } },
      relations: ['member', 'trainer'],
    });
  }

  async remove(id: string) {
    const assignment = await this.findOne(id);
    return this.assignmentsRepo.remove(assignment);
  }
}
