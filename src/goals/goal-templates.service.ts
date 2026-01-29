import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalTemplate } from '../entities/goal_templates.entity';
import { User } from '../entities/users.entity';
import {
  CreateGoalTemplateDto,
  UpdateGoalTemplateDto,
} from './dto/create-goal-template.dto';

@Injectable()
export class GoalTemplatesService {
  constructor(
    @InjectRepository(GoalTemplate)
    private goalTemplateRepository: Repository<GoalTemplate>,
  ) {}

  async create(dto: CreateGoalTemplateDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException('Only trainers and admins can create goal templates');
    }

    const goalTemplateData: any = {
      ...dto,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
    };
    const goalTemplate = this.goalTemplateRepository.create(goalTemplateData);

    return this.goalTemplateRepository.save(goalTemplate);
  }

  async findAll(user: User, filters?: { tags?: string[]; is_active?: boolean }) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    const queryBuilder = this.goalTemplateRepository
      .createQueryBuilder('gt')
      .leftJoinAndSelect('gt.trainer', 'trainer');

    if (isTrainer && user.trainerId) {
      // Trainers see their own templates
      queryBuilder.where('gt.trainerId = :trainerId', {
        trainerId: parseInt(user.trainerId),
      });
    }
    // Admins see all templates (no filter)

    if (filters?.is_active !== undefined) {
      queryBuilder.andWhere('gt.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }

    if (filters?.tags?.length) {
      queryBuilder.andWhere('gt.tags && :tags', { tags: filters.tags });
    }

    queryBuilder.orderBy('gt.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User) {
    const goalTemplate = await this.goalTemplateRepository.findOne({
      where: { template_id: id },
      relations: ['trainer'],
    });

    if (!goalTemplate) {
      throw new NotFoundException('Goal template not found');
    }

    // Check access
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && isTrainer && user.trainerId) {
      if (goalTemplate.trainerId !== parseInt(user.trainerId)) {
        throw new ForbiddenException('You can only access your own templates');
      }
    }

    return goalTemplate;
  }

  async update(id: string, dto: UpdateGoalTemplateDto, user: User) {
    const goalTemplate = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Only creator or admin can update
    if (!isAdmin && isTrainer && user.trainerId) {
      if (goalTemplate.trainerId !== parseInt(user.trainerId)) {
        throw new ForbiddenException('You can only update your own templates');
      }
    }

    Object.assign(goalTemplate, dto);
    return this.goalTemplateRepository.save(goalTemplate);
  }

  async remove(id: string, user: User) {
    const goalTemplate = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Only creator or admin can delete
    if (!isAdmin && isTrainer && user.trainerId) {
      if (goalTemplate.trainerId !== parseInt(user.trainerId)) {
        throw new ForbiddenException('You can only delete your own templates');
      }
    }

    await this.goalTemplateRepository.remove(goalTemplate);
    return { success: true, message: 'Goal template deleted' };
  }

  async copy(id: string, user: User) {
    const original = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isTrainer = userRole === 'TRAINER';

    const copyData: any = {
      title: `${original.title} (Copy)`,
      description: original.description,
      default_schedule_type: original.default_schedule_type,
      default_goals: original.default_goals,
      tags: original.tags,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
      usage_count: 0,
    };
    const copy = this.goalTemplateRepository.create(copyData);

    return this.goalTemplateRepository.save(copy);
  }
}
