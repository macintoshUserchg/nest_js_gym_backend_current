import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DietPlanAssignment,
  AssignmentStatus,
} from '../entities/diet_plan_assignments.entity';
import { DietPlan } from '../entities/diet_plans.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import {
  CreateDietAssignmentDto,
  UpdateDietProgressDto,
  DietSubstitutionDto,
  FilterDietAssignmentsDto,
} from './dto/diet-assignment.dto';

@Injectable()
export class DietPlanAssignmentsService {
  constructor(
    @InjectRepository(DietPlanAssignment)
    private assignmentRepository: Repository<DietPlanAssignment>,
    @InjectRepository(DietPlan)
    private dietPlanRepository: Repository<DietPlan>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(dto: CreateDietAssignmentDto, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    if (!isAdmin && !isTrainer) {
      throw new ForbiddenException(
        'Only trainers and admins can assign diet plans',
      );
    }

    // Verify diet plan exists
    const dietPlan = await this.dietPlanRepository.findOne({
      where: { plan_id: dto.diet_plan_id },
    });

    if (!dietPlan) {
      throw new NotFoundException('Diet plan not found');
    }

    // Verify member exists
    const member = await this.memberRepository.findOne({
      where: { id: dto.memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Create assignment
    const assignmentData: any = {
      diet_plan_id: dto.diet_plan_id,
      diet_plan: dietPlan,
      memberId: dto.memberId,
      member: member,
      assigned_by_user_id: user.userId,
      assigned_by: user,
      start_date: new Date(dto.start_date),
      status: AssignmentStatus.ACTIVE,
    };

    if (dto.end_date) {
      assignmentData.end_date = new Date(dto.end_date);
    }

    const assignment = this.assignmentRepository.create(assignmentData);

    return this.assignmentRepository.save(assignment);
  }

  async findAll(user: User, filters: FilterDietAssignmentsDto) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const isTrainer = userRole === 'TRAINER';

    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.diet_plan', 'diet_plan')
      .leftJoinAndSelect('assignment.member', 'member');

    if (filters.memberId) {
      queryBuilder.andWhere('assignment.memberId = :memberId', {
        memberId: filters.memberId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('assignment.status = :status', {
        status: filters.status,
      });
    }

    // Apply role-based filtering
    if (!isAdmin) {
      if (isTrainer && user.trainerId) {
        // Would filter by trainer assignment
        queryBuilder.andWhere('assignment.memberId IN (:...memberIds)', {
          memberIds: [filters.memberId].filter(Boolean),
        });
      } else if (userRole === 'MEMBER' && user.memberId) {
        queryBuilder.andWhere('assignment.memberId = :memberId', {
          memberId: parseInt(user.memberId),
        });
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    queryBuilder
      .orderBy('assignment.assigned_at', 'DESC')
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
    const assignment = await this.assignmentRepository.findOne({
      where: { assignment_id: id },
      relations: ['diet_plan', 'member', 'assigned_by'],
    });

    if (!assignment) {
      throw new NotFoundException('Diet assignment not found');
    }

    this.validateAccess(assignment, user);

    return assignment;
  }

  async findByMember(memberId: number, user: User) {
    const assignments = await this.assignmentRepository.find({
      where: { memberId },
      relations: ['diet_plan'],
      order: { assigned_at: 'DESC' },
    });

    return assignments;
  }

  async updateProgress(id: string, dto: UpdateDietProgressDto, user: User) {
    const assignment = await this.findOne(id, user);

    if (dto.completion_percent !== undefined) {
      assignment.completion_percent = dto.completion_percent;

      if (dto.completion_percent >= 100) {
        assignment.status = AssignmentStatus.COMPLETED;
      }
    }

    // Log progress
    if (!assignment.progress_log) {
      assignment.progress_log = [];
    }
    assignment.progress_log.push({
      date: new Date(),
      action: 'progress_update',
      details: dto,
    });

    assignment.last_activity_at = new Date();

    return this.assignmentRepository.save(assignment);
  }

  async addSubstitution(id: string, dto: DietSubstitutionDto, user: User) {
    const assignment = await this.findOne(id, user);

    if (!assignment.member_substitutions) {
      assignment.member_substitutions = [];
    }

    assignment.member_substitutions.push({
      original_meal: dto.original_meal,
      substituted_meal: dto.substituted_meal,
      reason: dto.reason,
      date: new Date(),
    });

    assignment.last_activity_at = new Date();

    return this.assignmentRepository.save(assignment);
  }

  async linkToChart(id: string, chartAssignmentId: string, user: User) {
    // This would link diet assignment to a workout chart assignment
    const assignment = await this.findOne(id, user);

    if (!assignment.progress_log) {
      assignment.progress_log = [];
    }
    assignment.progress_log.push({
      date: new Date(),
      action: 'chart_linked',
      details: { chart_assignment_id: chartAssignmentId },
    });

    return this.assignmentRepository.save(assignment);
  }

  async cancel(id: string, user: User) {
    const assignment = await this.findOne(id, user);

    assignment.status = AssignmentStatus.CANCELLED;

    return this.assignmentRepository.save(assignment);
  }

  async remove(id: string, user: User) {
    const assignment = await this.findOne(id, user);

    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isAdmin && assignment.assigned_by_user_id !== user.userId) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    await this.assignmentRepository.remove(assignment);

    return { success: true, message: 'Diet assignment deleted' };
  }

  private validateAccess(assignment: DietPlanAssignment, user: User) {
    const userRole = user.role?.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (isAdmin) return;

    if (userRole === 'MEMBER' && user.memberId) {
      if (assignment.memberId !== parseInt(user.memberId)) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Trainers can only access assignments for their members
    // Would check trainer-member assignment relationship
  }
}
