import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateShare } from '../entities/template_shares.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { DietTemplate } from '../entities/diet_templates.entity';
import { Trainer } from '../entities/trainers.entity';
import { paginate } from '../common/dto/pagination.dto';

@Injectable()
export class TemplateSharesService {
  constructor(
    @InjectRepository(TemplateShare)
    private templateShareRepository: Repository<TemplateShare>,
    @InjectRepository(WorkoutTemplate)
    private workoutTemplateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(DietTemplate)
    private dietTemplateRepository: Repository<DietTemplate>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async create(
    templateId: string,
    templateType: 'workout' | 'diet',
    trainerId: number,
    sharedByAdminId: string,
    adminNote?: string,
  ) {
    // Verify template exists
    let template;
    if (templateType === 'workout') {
      template = await this.workoutTemplateRepository.findOne({
        where: { template_id: templateId },
      });
    } else {
      template = await this.dietTemplateRepository.findOne({
        where: { template_id: templateId },
      });
    }

    if (!template) {
      throw new NotFoundException(`${templateType} template not found`);
    }

    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Check if share already exists
    const existingShare = await this.templateShareRepository.findOne({
      where: {
        template_id: templateId,
        template_type: templateType,
        shared_with_trainerId: trainerId,
      },
    });

    if (existingShare) {
      return existingShare;
    }

    const share = this.templateShareRepository.create({
      template_id: templateId,
      template_type: templateType,
      shared_with_trainerId: trainerId,
      shared_by_admin: sharedByAdminId as any,
      admin_note: adminNote,
      is_accepted: false,
    });

    return this.templateShareRepository.save(share);
  }

  async findAll(trainerId?: number, page = 1, limit = 20) {
    const queryBuilder = this.templateShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.shared_by_admin', 'shared_by_admin')
      .orderBy('share.shared_at', 'DESC');

    if (trainerId) {
      queryBuilder.where('share.shared_with_trainerId = :trainerId', {
        trainerId,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async acceptShare(shareId: string, trainerId: number) {
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

  async remove(shareId: string) {
    const share = await this.templateShareRepository.findOne({
      where: { share_id: shareId },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.templateShareRepository.remove(share);
    return { success: true, message: 'Template share deleted' };
  }
}
