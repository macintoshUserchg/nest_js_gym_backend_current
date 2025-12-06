import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLog } from '../entities/workout_logs.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';

@Injectable()
export class WorkoutLogsService {
  constructor(
    @InjectRepository(WorkoutLog)
    private workoutLogsRepo: Repository<WorkoutLog>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createWorkoutLogDto: CreateWorkoutLogDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createWorkoutLogDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createWorkoutLogDto.memberId} not found`,
      );
    }

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user has permission (GYM_OWNER, TRAINER, or MEMBER if managing themselves)
    const userRole = user.role.name;
    const isMember = userRole === 'MEMBER';

    if (isMember) {
      // Check if member is allowed to manage their own workout logs
      if (!member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own workout logs',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== member.id) {
        throw new ForbiddenException(
          'Members can only create workout logs for themselves',
        );
      }
    } else if (userRole !== 'GYM_OWNER' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners, trainers, or members (if allowed) can create workout logs',
      );
    }

    let trainer: Trainer | null = null;
    if (userRole === 'TRAINER' && user.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });
    } else if (createWorkoutLogDto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: createWorkoutLogDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createWorkoutLogDto.trainerId} not found`,
        );
      }
    }

    const workoutLogData: any = {
      member,
      exercise_name: createWorkoutLogDto.exercise_name,
      sets: createWorkoutLogDto.sets,
      reps: createWorkoutLogDto.reps,
      weight: createWorkoutLogDto.weight,
      duration: createWorkoutLogDto.duration,
      notes: createWorkoutLogDto.notes,
      date: new Date(createWorkoutLogDto.date),
    };

    if (trainer) {
      workoutLogData.trainer = trainer;
    }

    const workoutLog = this.workoutLogsRepo.create(workoutLogData);

    return this.workoutLogsRepo.save(workoutLog);
  }

  async findAll() {
    return this.workoutLogsRepo.find({
      relations: ['member', 'trainer'],
    });
  }

  async findOne(id: number) {
    const workoutLog = await this.workoutLogsRepo.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });
    if (!workoutLog) {
      throw new NotFoundException(`Workout log with ID ${id} not found`);
    }
    return workoutLog;
  }

  async update(
    id: number,
    updateWorkoutLogDto: UpdateWorkoutLogDto,
    userId: string,
  ) {
    const workoutLog = await this.findOne(id);

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    let isAssignedTrainer = false;
    if (workoutLog.trainer && user.trainerId) {
      isAssignedTrainer = workoutLog.trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own workout logs
    if (isMember) {
      if (!workoutLog.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own workout logs',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== workoutLog.member.id) {
        throw new ForbiddenException(
          'Members can only update their own workout logs',
        );
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can update workout logs',
      );
    }

    if (updateWorkoutLogDto.trainerId && userRole === 'GYM_OWNER') {
      const trainer = await this.trainersRepo.findOne({
        where: { id: updateWorkoutLogDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateWorkoutLogDto.trainerId} not found`,
        );
      }
      workoutLog.trainer = trainer;
    }

    Object.assign(workoutLog, updateWorkoutLogDto);
    if (updateWorkoutLogDto.date) {
      workoutLog.date = new Date(updateWorkoutLogDto.date);
    }

    return this.workoutLogsRepo.save(workoutLog);
  }

  async remove(id: number, userId: string) {
    const workoutLog = await this.findOne(id);

    // Check if user exists
    const user = await this.usersRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = user.role.name;
    const isOwner = userRole === 'GYM_OWNER';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    let isAssignedTrainer = false;
    if (workoutLog.trainer && user.trainerId) {
      isAssignedTrainer = workoutLog.trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own workout logs
    if (isMember) {
      if (!workoutLog.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own workout logs',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== workoutLog.member.id) {
        throw new ForbiddenException(
          'Members can only delete their own workout logs',
        );
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can delete workout logs',
      );
    }

    return this.workoutLogsRepo.remove(workoutLog);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.workoutLogsRepo.find({
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
        'Only gym owners and trainers can view workout logs',
      );
    }

    if (userRole === 'GYM_OWNER') {
      // Gym owners can see all workout logs
      return this.workoutLogsRepo.find({
        relations: ['member', 'trainer'],
        order: { date: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned workout logs
      if (!user.trainerId) {
        throw new NotFoundException(`Trainer ID not found for user ${userId}`);
      }
      const trainerId = parseInt(user.trainerId);
      return this.workoutLogsRepo.find({
        where: { trainer: { id: trainerId } },
        relations: ['member', 'trainer'],
        order: { date: 'DESC' },
      });
    }
  }
}
