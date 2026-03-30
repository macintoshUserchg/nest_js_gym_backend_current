import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietTemplate } from '../entities/diet_templates.entity';
import { DietTemplateMeal } from '../entities/diet_template_meals.entity';
import { TemplateShare } from '../entities/template_shares.entity';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { User } from '../entities/users.entity';
import {
  CreateDietTemplateDto,
  UpdateDietTemplateDto,
  CopyDietTemplateDto,
  RateDietTemplateDto,
  SubstituteMealDto,
  AssignDietTemplateDto,
} from '../diet-plans/dto/create-diet-template.dto';

@Injectable()
export class DietTemplatesService {
  constructor(
    @InjectRepository(DietTemplate)
    private dietTemplateRepository: Repository<DietTemplate>,
    @InjectRepository(DietTemplateMeal)
    private mealRepository: Repository<DietTemplateMeal>,
    @InjectRepository(TemplateShare)
    private templateShareRepository: Repository<TemplateShare>,
    @InjectRepository(TemplateAssignment)
    private templateAssignmentRepository: Repository<TemplateAssignment>,
  ) {}

  async create(dto: CreateDietTemplateDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException(
        'Only trainers and admins can create diet templates',
      );
    }

    const { meals, ...templateData } = dto;

    const templateDataWithTrainer: any = {
      ...templateData,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
      version: 1,
    };
    const template = this.dietTemplateRepository.create(
      templateDataWithTrainer,
    );

    const savedTemplate = await this.dietTemplateRepository.save(template);

    // Create meals
    if (meals?.length) {
      const mealsData: any[] = meals.map((meal: any) =>
        this.mealRepository.create({
          ...meal,
          template_id: savedTemplate['template_id'],
        }),
      );
      await this.mealRepository.save(mealsData);
    }

    return this.findOne(savedTemplate['template_id'], user);
  }

  async findAll(user: User, filters?: any) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    const queryBuilder = this.dietTemplateRepository
      .createQueryBuilder('dt')
      .leftJoinAndSelect('dt.meals', 'meals')
      .leftJoinAndSelect('dt.trainer', 'trainer');

    if (isAdmin) {
      // Admins see all templates in their gym
    } else if (isTrainer && user.trainerId) {
      queryBuilder.where(
        '(dt.trainerId = :trainerId OR dt.is_shared_gym = true)',
        { trainerId: parseInt(user.trainerId) },
      );
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (filters?.goal_type) {
      queryBuilder.andWhere('dt.goal_type = :goal_type', {
        goal_type: filters.goal_type,
      });
    }

    if (filters?.max_calories) {
      queryBuilder.andWhere('dt.target_calories <= :max_calories', {
        max_calories: filters.max_calories,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    queryBuilder
      .orderBy('dt.created_at', 'DESC')
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
    const template = await this.dietTemplateRepository.findOne({
      where: { template_id: id },
      relations: ['meals', 'trainer'],
    });

    if (!template) {
      throw new NotFoundException('Diet template not found');
    }

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin) {
      if (isTrainer && user.trainerId) {
        const hasAccess =
          template.trainerId === parseInt(user.trainerId) ||
          template.is_shared_gym ||
          (await this.isSharedWithTrainer(id, parseInt(user.trainerId)));
        if (!hasAccess) {
          throw new ForbiddenException('Access denied');
        }
      } else {
        throw new ForbiddenException('Access denied');
      }
    }

    return template;
  }

  async update(id: string, dto: UpdateDietTemplateDto, user: User) {
    const template = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (
      !isAdmin &&
      isTrainer &&
      user.trainerId &&
      template.trainerId !== parseInt(user.trainerId)
    ) {
      throw new ForbiddenException('You can only update your own templates');
    }

    // Update template fields only (meals not included in Update DTO)
    Object.assign(template, dto);
    const savedTemplate = await this.dietTemplateRepository.save(template);

    return this.findOne(savedTemplate.template_id, user);
  }

  async findByTrainer(trainerId: number, user: User) {
    this.validateTrainerAccess(trainerId, user);

    return this.dietTemplateRepository.find({
      where: { trainerId },
      relations: ['meals'],
      order: { created_at: 'DESC' },
    });
  }

  async copyTemplate(id: string, dto: CopyDietTemplateDto, user: User) {
    const original = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException(
        'Only trainers and admins can copy templates',
      );
    }

    const templateData: any = {
      title: dto.new_title || `Copy of ${original.title}`,
      description: dto.new_description || original.description,
      goal_type: original.goal_type,
      target_calories: original.target_calories,
      protein_g: original.protein_g,
      carbs_g: original.carbs_g,
      fat_g: original.fat_g,
      is_shared_gym: false,
      notes: original.notes,
      tags: original.tags,
      trainerId: isTrainer && user.trainerId ? parseInt(user.trainerId) : null,
      parent_template_id: original.template_id,
      version: original.version + 1,
    };

    const newTemplate = this.dietTemplateRepository.create(templateData);

    const savedTemplate = await this.dietTemplateRepository.save(newTemplate);

    // Copy meals
    if (original.meals?.length) {
      const mealsData: any[] = original.meals.map((meal: any) =>
        this.mealRepository.create({
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          description: meal.description,
          ingredients: meal.ingredients,
          preparation: meal.preparation,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          day_of_week: meal.day_of_week,
          order_index: meal.order_index,
          notes: meal.notes,
          alternatives: meal.alternatives,
          member_can_skip: meal.member_can_skip,
          template: { template_id: savedTemplate['template_id'] },
        }),
      );
      await this.mealRepository.save(mealsData);
    }

    return this.findOne(savedTemplate['template_id'], user);
  }

  async shareToTrainer(
    templateId: string,
    trainerId: number,
    adminUser: User,
    adminNote?: string,
  ) {
    const template = await this.dietTemplateRepository.findOne({
      where: { template_id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const existingShare = await this.templateShareRepository.findOne({
      where: { template_id: templateId, shared_with_trainerId: trainerId },
    });

    if (existingShare) {
      return existingShare;
    }

    const share = this.templateShareRepository.create({
      template_id: templateId,
      template_type: 'diet',
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
      template_type: 'diet',
      member: { memberId },
      trainer_assignmentId: assignmentId || null,
      start_date: dates?.start_date ? new Date(dates.start_date) : new Date(),
      end_date: dates?.end_date ? new Date(dates.end_date) : null,
    } as any);

    template.usage_count += 1;
    await this.dietTemplateRepository.save(template);

    return this.templateAssignmentRepository.save(assignment);
  }

  async rateTemplate(id: string, dto: RateDietTemplateDto, user: User) {
    const template = await this.findOne(id, user);

    const newRatingCount = template.rating_count + 1;
    const newAvgRating =
      ((template.avg_rating || 0) * template.rating_count + dto.rating) /
      newRatingCount;

    template.avg_rating = newAvgRating;
    template.rating_count = newRatingCount;

    return this.dietTemplateRepository.save(template);
  }

  async remove(id: string, user: User) {
    const template = await this.findOne(id, user);
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (
      !isAdmin &&
      isTrainer &&
      user.trainerId &&
      template.trainerId !== parseInt(user.trainerId)
    ) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    await this.dietTemplateRepository.remove(template);
    return { success: true, message: 'Template deleted' };
  }

  private async isSharedWithTrainer(
    templateId: string,
    trainerId: number,
  ): Promise<boolean> {
    const share = await this.templateShareRepository.findOne({
      where: {
        template_id: templateId,
        shared_with_trainerId: trainerId,
        is_accepted: true,
      },
    });
    return !!share;
  }

  private validateTrainerAccess(trainerId: number, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isAdmin && user.trainerId && trainerId !== parseInt(user.trainerId)) {
      throw new ForbiddenException('Access denied');
    }
  }
}
