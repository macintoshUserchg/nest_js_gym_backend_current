import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../entities/goals.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { User } from '../entities/users.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepo: Repository<Goal>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: string) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: createGoalDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createGoalDto.memberId} not found`,
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
      // Check if member is allowed to manage their own goals
      if (!member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own goals',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== member.id) {
        throw new ForbiddenException(
          'Members can only create goals for themselves',
        );
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'TRAINER') {
      throw new ForbiddenException(
        'Only gym owners, trainers, or members (if allowed) can create goals',
      );
    }

    let trainer: Trainer | null = null;
    if (userRole === 'TRAINER' && user.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: parseInt(user.trainerId) },
      });
    } else if (createGoalDto.trainerId) {
      trainer = await this.trainersRepo.findOne({
        where: { id: createGoalDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createGoalDto.trainerId} not found`,
        );
      }
    }

    const goalData: any = {
      member,
      goal_type: createGoalDto.goal_type,
      target_value: createGoalDto.target_value,
      target_timeline: createGoalDto.target_timeline
        ? new Date(createGoalDto.target_timeline)
        : null,
      milestone: createGoalDto.milestone,
      status: createGoalDto.status || 'active',
      completion_percent: createGoalDto.completion_percent || 0,
    };

    if (trainer) {
      goalData.trainer = trainer;
    }

    const goal = this.goalsRepo.create(goalData);

    return this.goalsRepo.save(goal);
  }

  async findAll() {
    return this.goalsRepo.find({
      relations: ['member', 'trainer'],
    });
  }

  async findOne(id: number) {
    const goal = await this.goalsRepo.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    return goal;
  }

  async update(id: number, updateGoalDto: UpdateGoalDto, userId: string) {
    const goal = await this.findOne(id);

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
    if (goal.trainer && user.trainerId) {
      isAssignedTrainer = goal.trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own goals
    if (isMember) {
      if (!goal.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own goals',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== goal.member.id) {
        throw new ForbiddenException('Members can only update their own goals');
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can update goals',
      );
    }

    if (updateGoalDto.trainerId && userRole === 'ADMIN') {
      const trainer = await this.trainersRepo.findOne({
        where: { id: updateGoalDto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateGoalDto.trainerId} not found`,
        );
      }
      goal.trainer = trainer;
    }

    Object.assign(goal, updateGoalDto);
    if (updateGoalDto.target_timeline) {
      goal.target_timeline = new Date(updateGoalDto.target_timeline);
    }

    return this.goalsRepo.save(goal);
  }

  async remove(id: number, userId: string) {
    const goal = await this.findOne(id);

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
    if (goal.trainer && user.trainerId) {
      isAssignedTrainer = goal.trainer.id === parseInt(user.trainerId);
    }

    // Check if member is allowed to manage their own goals
    if (isMember) {
      if (!goal.member.is_managed_by_member) {
        throw new ForbiddenException(
          'This member is not allowed to manage their own goals',
        );
      }
      // Check if the user is the member themselves
      if (!user.memberId || parseInt(user.memberId) !== goal.member.id) {
        throw new ForbiddenException('Members can only delete their own goals');
      }
    } else if (!isOwner && !(isTrainer && isAssignedTrainer)) {
      throw new ForbiddenException(
        'Only gym owners, assigned trainers, or members (if allowed) can delete goals',
      );
    }

    return this.goalsRepo.remove(goal);
  }

  async findByMember(memberId: number) {
    // Check if member exists
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.goalsRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'trainer'],
      order: { created_at: 'DESC' },
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
        'Only gym owners and trainers can view goals',
      );
    }

    if (userRole === 'ADMIN') {
      // Gym owners can see all goals
      return this.goalsRepo.find({
        relations: ['member', 'trainer'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Trainers can see only their assigned goals
      if (!user.trainerId) {
        throw new NotFoundException(`Trainer ID not found for user ${userId}`);
      }
      const trainerId = parseInt(user.trainerId);
      return this.goalsRepo.find({
        where: { trainer: { id: trainerId } },
        relations: ['member', 'trainer'],
        order: { created_at: 'DESC' },
      });
    }
  }
}
