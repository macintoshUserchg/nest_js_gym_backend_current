import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressTracking } from '../entities/progress_tracking.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class ProgressTrackingService {
  constructor(
    @InjectRepository(ProgressTracking)
    private progressTrackingRepo: Repository<ProgressTracking>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createProgressDto: CreateProgressDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createProgressDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createProgressDto.memberId} not found`,
      );
    }

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (ADMIN, TRAINER, or MEMBER if managing themselves)
    const userRole = user.role.name;
    const isMember = userRole === 'MEMBER';

    if (isMember) {
      // Check if member is allowed to manage their own progress tracking records
      if (!member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own progress tracking records',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== member.id) {
        throw new ForbiddenException(
          'Members can only create progress tracking records for themselves',
        );
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners, trainers, or members (if allowed) can create progress tracking records',
      );
    }

    let trainer: Trainer | null = null;
    if (userRole === 'TRAINER' && user.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });
    } else if (createProgressDto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: createProgressDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createProgressDto.trainerId} not found`,
        );
      }
    }

    const progressData: any = {
      member,
      record_date: new Date(createProgressDto.record_date),
      weight_kg: createProgressDto.weight_kg,
      height_cm: createProgressDto.height_cm,
      body_fat_percentage: createProgressDto.body_fat_percentage,
      muscle_mass_kg: createProgressDto.muscle_mass_kg,
      bmi: createProgressDto.bmi,
      chest_cm: createProgressDto.chest_cm,
      waist_cm: createProgressDto.waist_cm,
      arms_cm: createProgressDto.arms_cm,
      thighs_cm: createProgressDto.thighs_cm,
      notes: createProgressDto.notes,
      achievements: createProgressDto.achievements,
      photo_url: createProgressDto.photo_url,
    };

    if (trainer) {
      progressData.recorded_by_trainer = trainer;
    }

    const progressRecord = this.progressTrackingRepo.create(progressData);

    return this.progressTrackingRepo.save(progressRecord);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.progressTrackingRepo.findAndCount({
      relations: ['member', 'recorded_by_trainer'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(progress_id: string) {
    const progressRecord = await this.progressTrackingRepo.findOne({
      where: { progress_id },
      relations: ['member', 'recorded_by_trainer'],
    });
    if (!progressRecord) {
      throw new NotFoundException(
        `Progress tracking record with ID ${progress_id} not found`,
      );
    }
    return progressRecord;
  }

  async update(
    progress_id: string,
    updateProgressDto: UpdateProgressDto,
    userId: string,
  ) {
    const progressRecord = await this.findOne(progress_id);

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'ADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    let isAssignedTrainer = false;
    if (progressRecord.recorded_by_trainer && user.trainerId) {
      isAssignedTrainer =
        progressRecord.recorded_by_trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own progress tracking records
    if (isMember) {
      if (!progressRecord.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own progress tracking records',
        );
      }
      // Check if the user is the member themselves
      if (
        !user.memberId ||
        parseInt(user.memberId) !== progressRecord.member.id
      ) {
        throw new ForbiddenException(
          'Members can only update their own progress tracking records',
        );
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can update progress tracking records',
      );
    }

    if (updateProgressDto.trainerId && userRole === 'ADMIN') {
      const trainer = await this.trainersRepo.findOne({
        where: { id: updateProgressDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateProgressDto.trainerId} not found`,
        );
      }
      progressRecord.recorded_by_trainer = trainer;
    }

    Object.assign(progressRecord, updateProgressDto);
    if (updateProgressDto.record_date) {
      progressRecord.record_date = new Date(updateProgressDto.record_date);
    }

    return this.progressTrackingRepo.save(progressRecord);
  }

  async remove(progress_id: string, userId: string) {
    const progressRecord = await this.findOne(progress_id);

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'ADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    let isAssignedTrainer = false;
    if (progressRecord.recorded_by_trainer && user.trainerId) {
      isAssignedTrainer =
        progressRecord.recorded_by_trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own progress tracking records
    if (isMember) {
      if (!progressRecord.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own progress tracking records',
        );
      }
      // Check if the user is the member themselves
      if (
        !user.memberId ||
        parseInt(user.memberId) !== progressRecord.member.id
      ) {
        throw new ForbiddenException(
          'Members can only delete their own progress tracking records',
        );
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can delete progress tracking records',
      );
    }

    return this.progressTrackingRepo.remove(progressRecord);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.progressTrackingRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'recorded_by_trainer'],
      order: { record_date: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (ADMIN or TRAINER)
    const userRole = user.role.name;
    if (userRole !== 'ADMIN' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners and trainers can view progress tracking records',
      );
    }

    if (userRole === 'ADMIN') {
      // Gym owners can see all progress tracking records
      return this.progressTrackingRepo.find({
        relations: ['member', 'recorded_by_trainer'],
        order: { record_date: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned progress tracking records
      if (!user.trainerId) {
        throw new NotFoundException(`Trainer ID not found for user ${userId}`);
      }
      const trainerId = parseInt(user.trainerId);
      return this.progressTrackingRepo.find({
        where: { recorded_by_trainer: { id: trainerId } },
        relations: ['member', 'recorded_by_trainer'],
        order: { record_date: 'DESC' },
      });
    }
  }
}
