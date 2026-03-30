import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateAssignment } from '../entities/template_assignments.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { DietTemplate } from '../entities/diet_templates.entity';
import { User } from '../entities/users.entity';
import { Member } from '../entities/members.entity';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import {
  CreateTemplateAssignmentDto,
  UpdateProgressDto,
  FilterTemplateAssignmentsDto,
  SubstitutionDto,
} from './dto/create-template-assignment.dto';

@Injectable()
export class TemplateAssignmentsService {
  constructor(
    @InjectRepository(TemplateAssignment)
    private templateAssignmentRepository: Repository<TemplateAssignment>,
    @InjectRepository(WorkoutTemplate)
    private workoutTemplateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(DietTemplate)
    private dietTemplateRepository: Repository<DietTemplate>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberTrainerAssignment)
    private assignmentRepository: Repository<MemberTrainerAssignment>,
  ) {}

  async create(dto: CreateTemplateAssignmentDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    // Validate template exists
    if (dto.template_type === 'workout') {
      const template = await this.workoutTemplateRepository.findOne({
        where: { template_id: dto.template_id },
      });
      if (!template) {
        throw new NotFoundException('Workout template not found');
      }
    } else if (dto.template_type === 'diet') {
      const template = await this.dietTemplateRepository.findOne({
        where: { template_id: dto.template_id },
      });
      if (!template) {
        throw new NotFoundException('Diet template not found');
      }
    }

    // Check permissions
    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException(
        'Only trainers and admins can assign templates',
      );
    }

    // Load member entity
    const member = await this.memberRepository.findOne({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Load trainer assignment if provided
    let trainerAssignment: MemberTrainerAssignment | null = null;
    let trainerAssignmentId: string | undefined;
    if (dto.trainer_assignment_id) {
      trainerAssignment = await this.assignmentRepository.findOne({
        where: { assignment_id: dto.trainer_assignment_id.toString() },
      });
      trainerAssignmentId = trainerAssignment?.assignment_id;
    }

    const assignmentData: any = {
      template_id: dto.template_id,
      template_type: dto.template_type,
      memberId: dto.memberId,
      trainer_assignmentId: trainerAssignmentId,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
    };
    const assignment = this.templateAssignmentRepository.create(assignmentData);

    // Increment template usage
    await this.incrementTemplateUsage(dto.template_id, dto.template_type);

    return this.templateAssignmentRepository.save(assignment);
  }

  async findAll(user: User, filters?: FilterTemplateAssignmentsDto) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    const queryBuilder = this.templateAssignmentRepository
      .createQueryBuilder('ta')
      .leftJoinAndSelect('ta.member', 'member');

    if (isAdmin) {
      // Admins see all
      if (filters?.memberId) {
        queryBuilder.andWhere('ta.memberId = :memberId', {
          memberId: filters.memberId,
        });
      }
    } else if (isTrainer && user.trainerId) {
      // Trainers see only assignments for their members
      queryBuilder.where(
        'ta.trainer_assignmentId IN (SELECT id FROM member_trainer_assignments WHERE trainerId = :trainerId)',
        {
          trainerId: parseInt(user.trainerId),
        },
      );
      if (filters?.memberId) {
        queryBuilder.andWhere('ta.memberId = :memberId', {
          memberId: filters.memberId,
        });
      }
    } else if (isMember && user.memberId) {
      // Members see only their own
      queryBuilder.where('ta.memberId = :memberId', {
        memberId: parseInt(user.memberId),
      });
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (filters?.template_type) {
      queryBuilder.andWhere('ta.template_type = :template_type', {
        template_type: filters.template_type,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('ta.status = :status', { status: filters.status });
    }

    queryBuilder.orderBy('ta.assigned_at', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async findOne(id: string, user: User) {
    const assignment = await this.templateAssignmentRepository.findOne({
      where: { assignment_id: id },
      relations: ['member'],
    });

    if (!assignment) {
      throw new NotFoundException('Template assignment not found');
    }

    this.validateAccess(assignment, user);
    return assignment;
  }

  async findByMember(
    memberId: number,
    user: User,
    templateType?: 'workout' | 'diet',
  ) {
    // First verify access
    const assignments = await this.templateAssignmentRepository.find({
      where: { memberId },
      relations: ['member'],
      order: { assigned_at: 'DESC' },
    });

    if (!assignments.length) {
      return [];
    }

    // Validate access for first assignment
    this.validateAccess(assignments[0], user);

    let filtered = assignments;
    if (templateType) {
      filtered = assignments.filter((a) => a.template_type === templateType);
    }

    return filtered;
  }

  async updateProgress(id: string, dto: UpdateProgressDto, user: User) {
    const assignment = await this.findOne(id, user);

    // Members can update progress only for their own assignments
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && isTrainer) {
      // Trainer can update progress
    } else if (userRole === 'MEMBER') {
      if (!user.memberId || assignment.memberId !== parseInt(user.memberId)) {
        throw new ForbiddenException('You can only update your own progress');
      }
    }

    assignment.completion_percent = dto.completion_percent;
    assignment.last_activity_at = new Date();

    // Add substitutions if provided
    if (dto.substitutions?.length) {
      const newSubstitutions = dto.substitutions.map((s) => ({
        ...s,
        date: new Date(s.date),
      }));
      assignment.member_substitutions = [
        ...(assignment.member_substitutions || []),
        ...newSubstitutions,
      ];
    }

    // Add to progress log
    assignment.progress_log = [
      ...(assignment.progress_log || []),
      {
        date: new Date(),
        action: 'progress_update',
        details: {
          completion_percent: dto.completion_percent,
          notes: dto.notes,
          substitutions_count: dto.substitutions?.length || 0,
        },
      },
    ];

    return this.templateAssignmentRepository.save(assignment);
  }

  async addSubstitution(id: string, dto: SubstitutionDto, user: User) {
    const assignment = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isMember = userRole === 'MEMBER';

    if (isMember) {
      if (!user.memberId || assignment.memberId !== parseInt(user.memberId)) {
        throw new ForbiddenException(
          'You can only add substitutions to your own assignments',
        );
      }
    }

    assignment.member_substitutions = [
      ...(assignment.member_substitutions || []),
      {
        ...dto,
        date: new Date(dto.date),
      },
    ];
    assignment.last_activity_at = new Date();

    return this.templateAssignmentRepository.save(assignment);
  }

  async cancel(id: string, user: User) {
    const assignment = await this.findOne(id, user);
    assignment.status = 'cancelled';
    return this.templateAssignmentRepository.save(assignment);
  }

  async getAnalytics(user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can view analytics');
    }

    const totalAssignments = await this.templateAssignmentRepository.count();
    const activeAssignments = await this.templateAssignmentRepository.count({
      where: { status: 'active' },
    });
    const completedAssignments = await this.templateAssignmentRepository.count({
      where: { status: 'completed' },
    });

    const workoutAssignments = await this.templateAssignmentRepository.count({
      where: { template_type: 'workout' },
    });

    const dietAssignments = await this.templateAssignmentRepository.count({
      where: { template_type: 'diet' },
    });

    const avgCompletion = await this.templateAssignmentRepository
      .createQueryBuilder('ta')
      .select('AVG(ta.completion_percent)', 'avg')
      .where('ta.status = :status', { status: 'active' })
      .getRawOne();

    return {
      total_assignments: totalAssignments,
      active_assignments: activeAssignments,
      completed_assignments: completedAssignments,
      workout_assignments: workoutAssignments,
      diet_assignments: dietAssignments,
      average_completion_rate: parseFloat(avgCompletion?.avg || '0').toFixed(2),
    };
  }

  private async incrementTemplateUsage(
    templateId: string,
    templateType: 'workout' | 'diet',
  ) {
    if (templateType === 'workout') {
      await this.workoutTemplateRepository.increment(
        { template_id: templateId },
        'usage_count',
        1,
      );
    } else {
      await this.dietTemplateRepository.increment(
        { template_id: templateId },
        'usage_count',
        1,
      );
    }
  }

  private validateAccess(assignment: TemplateAssignment, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';
    const isMember = userRole === 'MEMBER';

    if (isAdmin) return;

    if (isTrainer && user.trainerId) {
      // Check if trainer is assigned to this member
      // For now, allow access if trainer_assignment exists
      if (assignment.trainer_assignmentId) {
        return;
      }
      throw new ForbiddenException('You are not assigned to this member');
    } else if (isMember && user.memberId) {
      if (assignment.memberId !== parseInt(user.memberId)) {
        throw new ForbiddenException('Access denied');
      }
    } else {
      throw new ForbiddenException('Access denied');
    }
  }
}
