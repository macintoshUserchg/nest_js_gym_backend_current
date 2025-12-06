import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyProgress } from '../entities/body_progress.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { CreateBodyProgressDto } from './dto/create-body-progress.dto';
import { UpdateBodyProgressDto } from './dto/update-body-progress.dto';

@Injectable()
export class BodyProgressService {
  constructor(
    @InjectRepository(BodyProgress)
    private bodyProgressRepo: Repository<BodyProgress>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createBodyProgressDto: CreateBodyProgressDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createBodyProgressDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createBodyProgressDto.memberId} not found`,
      );
    }

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (GYM_OWNER or TRAINER)
    const userRole = user.role.name;
    if (userRole !== 'GYM_OWNER' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners and trainers can create body progress records',
      );
    }

    let trainer: Trainer | null = null;
    if (userRole === 'TRAINER' && user.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });
    } else if (createBodyProgressDto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: createBodyProgressDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createBodyProgressDto.trainerId} not found`,
        );
      }
    }

    const bodyProgressData: any = {
      member,
      weight: createBodyProgressDto.weight,
      body_fat: createBodyProgressDto.body_fat,
      bmi: createBodyProgressDto.bmi,
      measurements: createBodyProgressDto.measurements,
      progress_photos: createBodyProgressDto.progress_photos,
      date: new Date(createBodyProgressDto.date),
    };

    if (trainer) {
      bodyProgressData.trainer = trainer;
    }

    const bodyProgress = this.bodyProgressRepo.create(bodyProgressData);

    return this.bodyProgressRepo.save(bodyProgress);
  }

  async findAll() {
    return this.bodyProgressRepo.find({
      relations: ['member', 'trainer'],
    });
  }

  async findOne(id: number) {
    const bodyProgress = await this.bodyProgressRepo.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });
    if (!bodyProgress) {
      throw new NotFoundException(
        `Body progress record with ID ${id} not found`,
      );
    }
    return bodyProgress;
  }

  async update(
    id: number,
    updateBodyProgressDto: UpdateBodyProgressDto,
    userId: string,
  ) {
    const bodyProgress = await this.findOne(id);

    // Check if user has permission to update (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';

    let isAssignedTrainer = false;
    if (bodyProgress.trainer && user.trainerId) {
      isAssignedTrainer = bodyProgress.trainer.id === parseInt(user.trainerId);
    }

    if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners or the trainer assigned to this body progress record can update it',
      );
    }

    if (updateBodyProgressDto.trainerId && userRole === 'GYM_OWNER') {
      const trainer = await this.trainersRepo.findOne({
        where: { id: updateBodyProgressDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateBodyProgressDto.trainerId} not found`,
        );
      }
      bodyProgress.trainer = trainer;
    }

    Object.assign(bodyProgress, updateBodyProgressDto);
    if (updateBodyProgressDto.date) {
      bodyProgress.date = new Date(updateBodyProgressDto.date);
    }

    return this.bodyProgressRepo.save(bodyProgress);
  }

  async remove(id: number, userId: string) {
    const bodyProgress = await this.findOne(id);

    // Check if user has permission to delete (GYM_OWNER or TRAINER who created it)
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';

    let isAssignedTrainer = false;
    if (bodyProgress.trainer && user.trainerId) {
      isAssignedTrainer = bodyProgress.trainer.id === parseInt(user.trainerId);
    }

    if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners or the trainer assigned to this body progress record can delete it',
      );
    }

    return this.bodyProgressRepo.remove(bodyProgress);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.bodyProgressRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'trainer'],
      order: { date: 'DESC' },
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

    // Check if user has permission (GYM_OWNER or TRAINER)
    const userRole = user.role.name;
    if (userRole !== 'GYM_OWNER' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners and trainers can view body progress records',
      );
    }

    if (userRole === 'GYM_OWNER') {
      // Gym owners can see all body progress records
      return this.bodyProgressRepo.find({
        relations: ['member', 'trainer'],
        order: { date: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned body progress records
      if (!user.trainerId) {
        throw new NotFoundException(`Trainer ID not found for user ${userId}`);
      }
      const trainerId = parseInt(user.trainerId);
      return this.bodyProgressRepo.find({
        where: { trainer: { id: trainerId } },
        relations: ['member', 'trainer'],
        order: { date: 'DESC' },
      });
    }
  }
}
