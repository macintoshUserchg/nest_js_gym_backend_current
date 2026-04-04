import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { DietTemplate } from '../entities/diet_templates.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { paginate } from '../common/dto/pagination.dto';

export interface AssignTemplateDto {
  workout_template_id?: string;
  diet_template_id?: string;
  workout_start_date?: string;
  workout_end_date?: string;
  diet_start_date?: string;
  diet_end_date?: string;
  auto_apply_templates?: boolean;
  allow_member_substitutions?: boolean;
}

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(MemberTrainerAssignment)
    private assignmentsRepo: Repository<MemberTrainerAssignment>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(WorkoutTemplate)
    private workoutTemplateRepo: Repository<WorkoutTemplate>,
    @InjectRepository(DietTemplate)
    private dietTemplateRepo: Repository<DietTemplate>,
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

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.assignmentsRepo.findAndCount({
      relations: ['member', 'trainer'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
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

  // ===== Template Assignment Methods =====

  async assignTemplates(id: string, dto: AssignTemplateDto) {
    const assignment = await this.findOne(id);

    // Validate workout template if provided
    if (dto.workout_template_id) {
      const template = await this.workoutTemplateRepo.findOne({
        where: { template_id: dto.workout_template_id },
      });
      if (!template) {
        throw new NotFoundException('Workout template not found');
      }
      assignment.assigned_workout_template_id = dto.workout_template_id;
      if (dto.workout_start_date) {
        assignment.workout_start_date = new Date(dto.workout_start_date);
      }
      if (dto.workout_end_date) {
        assignment.workout_end_date = new Date(dto.workout_end_date);
      }
    }

    // Validate diet template if provided
    if (dto.diet_template_id) {
      const template = await this.dietTemplateRepo.findOne({
        where: { template_id: dto.diet_template_id },
      });
      if (!template) {
        throw new NotFoundException('Diet template not found');
      }
      assignment.assigned_diet_template_id = dto.diet_template_id;
      if (dto.diet_start_date) {
        assignment.diet_start_date = new Date(dto.diet_start_date);
      }
      if (dto.diet_end_date) {
        assignment.diet_end_date = new Date(dto.diet_end_date);
      }
    }

    // Update template settings
    if (dto.auto_apply_templates !== undefined) {
      assignment.auto_apply_templates = dto.auto_apply_templates;
    }
    if (dto.allow_member_substitutions !== undefined) {
      assignment.allow_member_substitutions = dto.allow_member_substitutions;
    }

    // Increment template usage counts
    if (dto.workout_template_id) {
      await this.workoutTemplateRepo.increment(
        { template_id: dto.workout_template_id },
        'usage_count',
        1,
      );
    }
    if (dto.diet_template_id) {
      await this.dietTemplateRepo.increment(
        { template_id: dto.diet_template_id },
        'usage_count',
        1,
      );
    }

    return this.assignmentsRepo.save(assignment);
  }

  async getAssignedTemplates(id: string) {
    const assignment = await this.findOne(id);

    const result: any = {
      assignment_id: assignment.assignment_id,
      member: assignment.member,
      trainer: assignment.trainer,
      auto_apply_templates: assignment.auto_apply_templates,
      allow_member_substitutions: assignment.allow_member_substitutions,
    };

    // Fetch workout template if assigned
    if (assignment.assigned_workout_template_id) {
      const workoutTemplate = await this.workoutTemplateRepo.findOne({
        where: { template_id: assignment.assigned_workout_template_id },
      });
      result.workout_template = workoutTemplate;
      result.workout_start_date = assignment.workout_start_date;
      result.workout_end_date = assignment.workout_end_date;
    }

    // Fetch diet template if assigned
    if (assignment.assigned_diet_template_id) {
      const dietTemplate = await this.dietTemplateRepo.findOne({
        where: { template_id: assignment.assigned_diet_template_id },
      });
      result.diet_template = dietTemplate;
      result.diet_start_date = assignment.diet_start_date;
      result.diet_end_date = assignment.diet_end_date;
    }

    return result;
  }

  async removeTemplate(id: string, templateType: 'workout' | 'diet') {
    const assignment = await this.findOne(id);

    if (templateType === 'workout') {
      assignment.assigned_workout_template_id = undefined;
      assignment.workout_start_date = undefined;
      assignment.workout_end_date = undefined;
    } else {
      assignment.assigned_diet_template_id = undefined;
      assignment.diet_start_date = undefined;
      assignment.diet_end_date = undefined;
    }

    return this.assignmentsRepo.save(assignment);
  }

  async updateTemplateSettings(
    id: string,
    settings: {
      auto_apply_templates?: boolean;
      allow_member_substitutions?: boolean;
    },
  ) {
    const assignment = await this.findOne(id);

    if (settings.auto_apply_templates !== undefined) {
      assignment.auto_apply_templates = settings.auto_apply_templates;
    }
    if (settings.allow_member_substitutions !== undefined) {
      assignment.allow_member_substitutions =
        settings.allow_member_substitutions;
    }

    return this.assignmentsRepo.save(assignment);
  }
}
