import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { GoalSchedule } from '../entities/goal_schedules.entity';
import { GoalTemplate } from '../entities/goal_templates.entity';
import { User } from '../entities/users.entity';
import {
  CreateGoalScheduleDto,
  CreateGoalScheduleFromTemplateDto,
  UpdatePeriodProgressDto,
  FilterGoalsDto,
} from './dto/create-goal-schedule.dto';

@Injectable()
export class GoalSchedulesService {
  constructor(
    @InjectRepository(GoalSchedule)
    private goalScheduleRepository: Repository<GoalSchedule>,
    @InjectRepository(GoalTemplate)
    private goalTemplateRepository: Repository<GoalTemplate>,
  ) {}

  async create(dto: CreateGoalScheduleDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Validate member access
    if (dto.memberId && !isAdmin) {
      if (isTrainer) {
        // Check if trainer is assigned to this member
        const assignment = await this.checkTrainerAssignment(
          dto.trainerId,
          dto.memberId,
        );
        if (!assignment) {
          throw new ForbiddenException('You are not assigned to this member');
        }
      } else if (userRole === 'MEMBER') {
        if (user.memberId && parseInt(user.memberId) !== dto.memberId) {
          throw new ForbiddenException(
            'Members can only create goals for themselves',
          );
        }
      }
    }

    const goalSchedule = this.goalScheduleRepository.create({
      ...dto,
      assigned_trainerId:
        dto.trainerId ||
        (isTrainer && user.trainerId ? parseInt(user.trainerId) : null),
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
    } as any);

    return this.goalScheduleRepository.save(goalSchedule);
  }

  async createFromTemplate(dto: CreateGoalScheduleFromTemplateDto, user: User) {
    const template = await this.goalTemplateRepository.findOne({
      where: { template_id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Goal template not found');
    }

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Validate member access
    if (!isAdmin) {
      if (isTrainer) {
        const assignment = await this.checkTrainerAssignment(
          dto.trainerId,
          dto.memberId,
        );
        if (!assignment) {
          throw new ForbiddenException('You are not assigned to this member');
        }
      } else if (userRole === 'MEMBER') {
        if (user.memberId && parseInt(user.memberId) !== dto.memberId) {
          throw new ForbiddenException(
            'Members can only create goals for themselves',
          );
        }
      }
    }

    const goalSchedule = this.goalScheduleRepository.create({
      title: template.title,
      description: template.description,
      schedule_type: template.default_schedule_type,
      target_goals: template.default_goals.map((g, index) => ({
        id: `goal_${index}`,
        ...g,
        is_completed: false,
      })),
      member: { id: dto.memberId },
      assigned_trainerId:
        dto.trainerId ||
        (isTrainer && user.trainerId ? parseInt(user.trainerId) : null),
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
    } as any);

    // Increment template usage
    template.usage_count += 1;
    await this.goalTemplateRepository.save(template);

    return this.goalScheduleRepository.save(goalSchedule);
  }

  async findAll(user: User, filters?: FilterGoalsDto) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    const queryBuilder = this.goalScheduleRepository
      .createQueryBuilder('gs')
      .leftJoinAndSelect('gs.assigned_trainer', 'trainer')
      .leftJoinAndSelect('gs.member', 'member');

    if (isAdmin) {
      // Admins see all in their gym
      // Add gym filter if needed
    } else if (isTrainer && user.trainerId) {
      // Trainers see only assigned members' goals
      queryBuilder.where('gs.assigned_trainerId = :trainerId', {
        trainerId: parseInt(user.trainerId),
      });
    } else if (isMember && user.memberId) {
      // Members see only their own goals
      queryBuilder.where('gs.memberId = :memberId', {
        memberId: parseInt(user.memberId),
      });
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (filters?.status) {
      queryBuilder.andWhere('gs.status = :status', { status: filters.status });
    }

    if (filters?.schedule_type) {
      queryBuilder.andWhere('gs.schedule_type = :schedule_type', {
        schedule_type: filters.schedule_type,
      });
    }

    if (filters?.memberId && isAdmin) {
      queryBuilder.andWhere('gs.memberId = :memberId', {
        memberId: filters.memberId,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    queryBuilder
      .orderBy('gs.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User) {
    const goalSchedule = await this.goalScheduleRepository.findOne({
      where: { schedule_id: id },
      relations: ['assigned_trainer', 'member'],
    });

    if (!goalSchedule) {
      throw new NotFoundException('Goal schedule not found');
    }

    this.validateAccess(goalSchedule, user);
    return goalSchedule;
  }

  async findByMember(memberId: number, user: User) {
    const goalSchedule = await this.goalScheduleRepository
      .createQueryBuilder('gs')
      .where('gs.memberId = :memberId', { memberId })
      .leftJoinAndSelect('gs.assigned_trainer', 'trainer')
      .orderBy('gs.created_at', 'DESC')
      .getMany();

    if (!goalSchedule.length) {
      return [];
    }

    // Validate access for first item (all belong to same member)
    this.validateAccess(goalSchedule[0], user);
    return goalSchedule;
  }

  async updatePeriodProgress(
    id: string,
    dto: UpdatePeriodProgressDto,
    user: User,
  ) {
    const goalSchedule = await this.findOne(id, user);
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Check permission to update
    if (!isAdmin) {
      if (isTrainer && user.trainerId) {
        if (goalSchedule.assigned_trainerId !== parseInt(user.trainerId)) {
          throw new ForbiddenException('You are not assigned to this member');
        }
      } else if (userRole === 'MEMBER') {
        // Member can only update their own goals if no trainer assigned
        if (
          goalSchedule.assigned_trainerId &&
          goalSchedule.member &&
          user.memberId &&
          parseInt(user.memberId) !== goalSchedule.member.id
        ) {
          throw new ForbiddenException('You cannot update this goal schedule');
        }
      }
    }

    // Update target goals with completed values
    if (dto.completed_goals?.length) {
      goalSchedule.target_goals = goalSchedule.target_goals.map((goal) => {
        const completed = dto.completed_goals.find(
          (cg) => cg.goal_id === goal.id,
        );
        if (completed) {
          return {
            ...goal,
            is_completed: true,
            completed_value: completed.achieved_value,
            completed_at: new Date(completed.completion_date),
          };
        }
        return goal;
      });
    }

    // Update or add period progress
    const existingProgressIndex = goalSchedule.period_progress?.findIndex(
      (p) => p.period_number === dto.period_number,
    );

    const newProgress = {
      period_number: dto.period_number,
      completed_goals: dto.completed_goals.map((cg) => ({
        ...cg,
        completion_date: new Date(cg.completion_date),
      })),
      member_notes: dto.member_notes,
      trainer_notes: dto.trainer_notes,
      status: dto.status,
    };

    if (
      goalSchedule.period_progress &&
      existingProgressIndex !== undefined &&
      existingProgressIndex >= 0
    ) {
      goalSchedule.period_progress[existingProgressIndex] = newProgress;
    } else {
      goalSchedule.period_progress = [
        ...(goalSchedule.period_progress || []),
        newProgress,
      ];
    }

    goalSchedule.current_period = dto.period_number;
    goalSchedule.last_activity_date = new Date();

    // Check if all goals are completed
    const allCompleted = goalSchedule.target_goals.every((g) => g.is_completed);
    if (allCompleted) {
      goalSchedule.status = 'completed';
    } else if (dto.status === 'missed') {
      goalSchedule.status = 'active';
    }

    return this.goalScheduleRepository.save(goalSchedule);
  }

  async pauseSchedule(id: string, user: User) {
    const goalSchedule = await this.findOne(id, user);
    this.validateAdminOrAssignedTrainer(goalSchedule, user);

    goalSchedule.status = 'paused';
    return this.goalScheduleRepository.save(goalSchedule);
  }

  async resumeSchedule(id: string, user: User) {
    const goalSchedule = await this.findOne(id, user);
    this.validateAdminOrAssignedTrainer(goalSchedule, user);

    goalSchedule.status = 'active';
    return this.goalScheduleRepository.save(goalSchedule);
  }

  async completeSchedule(id: string, user: User) {
    const goalSchedule = await this.findOne(id, user);
    this.validateAdminOrAssignedTrainer(goalSchedule, user);

    goalSchedule.status = 'completed';
    goalSchedule.is_active = false;
    return this.goalScheduleRepository.save(goalSchedule);
  }

  async remove(id: string, user: User) {
    const goalSchedule = await this.findOne(id, user);
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Only creator or admin can delete
    if (!isAdmin && isTrainer && user.trainerId) {
      if (goalSchedule.assigned_trainerId !== parseInt(user.trainerId)) {
        throw new ForbiddenException(
          'You can only delete your own goal schedules',
        );
      }
    }

    await this.goalScheduleRepository.remove(goalSchedule);
    return { success: true, message: 'Goal schedule deleted' };
  }

  private async checkTrainerAssignment(
    trainerId: number | undefined,
    memberId: number,
  ) {
    // This would check the assignments table
    // For now, return true if trainerId is provided
    return !!trainerId;
  }

  private validateAccess(goalSchedule: GoalSchedule, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    if (isAdmin) return;

    if (isTrainer && user.trainerId) {
      if (goalSchedule.assigned_trainerId !== parseInt(user.trainerId)) {
        throw new ForbiddenException('You are not assigned to this member');
      }
    } else if (isMember && user.memberId) {
      if (
        goalSchedule.member &&
        parseInt(user.memberId) !== goalSchedule.member.id
      ) {
        throw new ForbiddenException('Access denied');
      }
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  private validateAdminOrAssignedTrainer(
    goalSchedule: GoalSchedule,
    user: User,
  ) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isAdmin) {
      if (userRole === 'TRAINER' && user.trainerId) {
        if (goalSchedule.assigned_trainerId !== parseInt(user.trainerId)) {
          throw new ForbiddenException('You are not assigned to this member');
        }
      } else if (userRole === 'MEMBER') {
        throw new ForbiddenException(
          'Only trainers or admins can perform this action',
        );
      }
    }
  }
}
