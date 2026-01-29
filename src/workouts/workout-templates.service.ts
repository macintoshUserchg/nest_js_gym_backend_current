import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { WorkoutTemplateExercise } from '../entities/workout_template_exercises.entity';
import { TemplateShare } from '../entities/template_shares.entity';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { User } from '../entities/users.entity';
import {
  CreateWorkoutTemplateDto,
  UpdateWorkoutTemplateDto,
  CopyWorkoutTemplateDto,
  RateWorkoutTemplateDto,
  SubstituteExerciseDto,
  AssignWorkoutTemplateDto,
  FilterTemplatesDto,
} from './dto/create-workout-template.dto';

@Injectable()
export class WorkoutTemplatesService {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private workoutTemplateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(WorkoutTemplateExercise)
    private exerciseRepository: Repository<WorkoutTemplateExercise>,
    @InjectRepository(TemplateShare)
    private templateShareRepository: Repository<TemplateShare>,
    @InjectRepository(TemplateAssignment)
    private templateAssignmentRepository: Repository<TemplateAssignment>,
  ) {}

  async create(dto: CreateWorkoutTemplateDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException('Only trainers and admins can create workout templates');
    }

    const { exercises, ...templateData } = dto;

    const template = this.workoutTemplateRepository.create({
      ...templateData,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
      version: 1,
    } as any);

    const savedTemplate = await this.workoutTemplateRepository.save(template);

    // Create exercises
    if (exercises?.length) {
      const exercisesData: any[] = exercises.map((ex: any) =>
        this.exerciseRepository.create({
          ...ex,
          template_id: savedTemplate['template_id'],
        }),
      );
      await this.exerciseRepository.save(exercisesData);
    }

    return this.findOne(savedTemplate['template_id'], user);
  }

  async findAll(user: User, filters?: FilterTemplatesDto) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    const queryBuilder = this.workoutTemplateRepository
      .createQueryBuilder('wt')
      .leftJoinAndSelect('wt.exercises', 'exercises')
      .leftJoinAndSelect('wt.trainer', 'trainer');

    if (isAdmin) {
      // Admins see all templates in their gym
    } else if (isTrainer && user.trainerId) {
      // Trainers see their own templates + templates shared with them
      queryBuilder.where(
        '(wt.trainerId = :trainerId OR wt.is_shared_gym = true)',
        { trainerId: parseInt(user.trainerId) },
      );
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (filters?.difficulty_level) {
      queryBuilder.andWhere('wt.difficulty_level = :difficulty_level', {
        difficulty_level: filters.difficulty_level,
      });
    }

    if (filters?.plan_type) {
      queryBuilder.andWhere('wt.plan_type = :plan_type', {
        plan_type: filters.plan_type,
      });
    }

    if (filters?.tags?.length) {
      queryBuilder.andWhere('wt.tags && :tags', { tags: filters.tags });
    }

    if (filters?.trainerId && isAdmin) {
      queryBuilder.andWhere('wt.trainerId = :trainerId', {
        trainerId: filters.trainerId,
      });
    }

    if (filters?.shared_only) {
      queryBuilder.andWhere('wt.is_shared_gym = true');
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    queryBuilder
      .orderBy('wt.created_at', 'DESC')
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
    const template = await this.workoutTemplateRepository.findOne({
      where: { template_id: id },
      relations: ['exercises', 'trainer'],
    });

    if (!template) {
      throw new NotFoundException('Workout template not found');
    }

    // Check access
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin) {
      if (isTrainer && user.trainerId) {
        const hasAccess =
          template.trainerId === parseInt(user.trainerId) ||
          template.is_shared_gym ||
          await this.isSharedWithTrainer(id, parseInt(user.trainerId));
        if (!hasAccess) {
          throw new ForbiddenException('Access denied');
        }
      } else {
        throw new ForbiddenException('Access denied');
      }
    }

    return template;
  }

  async findByTrainer(trainerId: number, user: User) {
    this.validateTrainerAccess(trainerId, user);

    return this.workoutTemplateRepository.find({
      where: { trainerId },
      relations: ['exercises'],
      order: { created_at: 'DESC' },
    });
  }

  async copyTemplate(id: string, dto: CopyWorkoutTemplateDto, user: User) {
    const original = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException('Only trainers and admins can copy templates');
    }

    const templateData = {
      title: dto.new_title || `Copy of ${original.title}`,
      description: dto.new_description || original.description,
      difficulty_level: original.difficulty_level,
      plan_type: original.plan_type,
      duration_days: original.duration_days,
      is_shared_gym: false,
      notes: original.notes,
      tags: original.tags,
    };

    const newTemplate = this.workoutTemplateRepository.create({
      ...templateData,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
      parent_template_id: original.template_id,
      version: original.version + 1,
    } as any);

    const savedTemplate = await this.workoutTemplateRepository.save(newTemplate);

    // Copy exercises
    if (original.exercises?.length) {
      const exercisesData: any[] = original.exercises.map((ex: any) =>
        this.exerciseRepository.create({
          exercise_name: ex.exercise_name,
          description: ex.description,
          exercise_type: ex.exercise_type,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          duration_minutes: ex.duration_minutes,
          distance_km: ex.distance_km,
          day_of_week: ex.day_of_week,
          order_index: ex.order_index,
          instructions: ex.instructions,
          alternatives: ex.alternatives,
          member_can_skip: ex.member_can_skip,
          template: { template_id: savedTemplate['template_id'] },
        }),
      );
      await this.exerciseRepository.save(exercisesData);
    }

    return this.findOne(savedTemplate['template_id'], user);
  }

  async shareToTrainer(
    templateId: string,
    trainerId: number,
    adminUser: User,
    adminNote?: string,
  ) {
    const template = await this.workoutTemplateRepository.findOne({
      where: { template_id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if already shared
    const existingShare = await this.templateShareRepository.findOne({
      where: { template_id: templateId, shared_with_trainerId: trainerId },
    });

    if (existingShare) {
      return existingShare;
    }

    const share = this.templateShareRepository.create({
      template_id: templateId,
      template_type: 'workout',
      shared_with_trainerId: trainerId,
      shared_by_admin: adminUser,
      admin_note: adminNote,
    });

    return this.templateShareRepository.save(share);
  }

  async acceptSharedTemplate(shareId: string, trainerId: number) {
    const share = await this.templateShareRepository.findOne({
      where: { share_id: shareId },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.shared_with_trainerId !== trainerId) {
      throw new ForbiddenException('This share is not for you');
    }

    share.is_accepted = true;
    share.accepted_at = new Date();

    return this.templateShareRepository.save(share);
  }

  async assignToMember(
    templateId: string,
    memberId: number,
    assignmentId?: string,
    dates?: { start_date?: string; end_date?: string },
    user?: User,
  ) {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    const template = await this.findOne(templateId, user);

    const assignment = this.templateAssignmentRepository.create({
      template_id: templateId,
      template_type: 'workout',
      member: { memberId },
      trainer_assignmentId: assignmentId || null,
      start_date: dates?.start_date ? new Date(dates.start_date) : new Date(),
      end_date: dates?.end_date ? new Date(dates.end_date) : null,
    } as any);

    // Increment usage
    template.usage_count += 1;
    await this.workoutTemplateRepository.save(template);

    return this.templateAssignmentRepository.save(assignment);
  }

  async rateTemplate(id: string, dto: RateWorkoutTemplateDto, user: User) {
    const template = await this.findOne(id, user);

    const newRatingCount = template.rating_count + 1;
    const newAvgRating =
      ((template.avg_rating || 0) * template.rating_count + dto.rating) / newRatingCount;

    template.avg_rating = newAvgRating;
    template.rating_count = newRatingCount;

    return this.workoutTemplateRepository.save(template);
  }

  async remove(id: string, user: User) {
    const template = await this.findOne(id, user);
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && isTrainer && user.trainerId && template.trainerId !== parseInt(user.trainerId)) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    await this.workoutTemplateRepository.remove(template);
    return { success: true, message: 'Template deleted' };
  }

  private async isSharedWithTrainer(templateId: string, trainerId: number): Promise<boolean> {
    const share = await this.templateShareRepository.findOne({
      where: { template_id: templateId, shared_with_trainerId: trainerId, is_accepted: true },
    });
    return !!share;
  }

  private validateTrainerAccess(trainerId: number, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'GYM_OWNER' || userRole === 'SUPERADMIN';

    if (!isAdmin && user.trainerId && trainerId !== parseInt(user.trainerId)) {
      throw new ForbiddenException('Access denied');
    }
  }
}
