import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkoutPlanChartAssignment,
  ChartAssignmentStatus,
} from '../entities/workout_plan_chart_assignments.entity';
import { WorkoutTemplate } from '../entities/workout_templates.entity';
import { Member } from '../entities/members.entity';
import { User } from '../entities/users.entity';
import { CreateChartAssignmentDto } from './dto/create-chart-assignment.dto';
import { UpdateChartAssignmentDto } from './dto/update-chart-assignment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkoutPlanChartAssignmentsService {
  constructor(
    @InjectRepository(WorkoutPlanChartAssignment)
    private assignmentRepository: Repository<WorkoutPlanChartAssignment>,
    @InjectRepository(WorkoutTemplate)
    private chartRepository: Repository<WorkoutTemplate>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateChartAssignmentDto, currentUser: User) {
    // Verify chart exists (WorkoutTemplate uses template_id as primary key)
    const chart = await this.chartRepository.findOne({
      where: { template_id: dto.chart_id },
    });
    if (!chart) {
      throw new NotFoundException('Workout chart not found');
    }

    // Verify member exists (Member uses id, not memberId)
    const member = await this.memberRepository.findOne({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check for duplicate active assignment
    const existingActive = await this.assignmentRepository.findOne({
      where: {
        chart_id: dto.chart_id,
        memberId: dto.memberId,
        status: ChartAssignmentStatus.ACTIVE,
      },
    });
    if (existingActive) {
      throw new BadRequestException(
        'This chart is already assigned to this member',
      );
    }

    // Build assignment data object to avoid null issues with TypeORM
    const assignmentData: Partial<WorkoutPlanChartAssignment> = {
      chart_id: dto.chart_id,
      memberId: dto.memberId,
      assigned_by_user_id: currentUser.userId,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      status: ChartAssignmentStatus.ACTIVE,
      completion_percent: 0,
      customizations: {
        skipped_exercises: [],
        modified_sets: [],
        modified_reps: [],
        notes: dto.notes || '',
      },
      member_substitutions: [],
    };

    const assignment = this.assignmentRepository.create(assignmentData);
    const saved = await this.assignmentRepository.save(assignment);

    // Increment chart usage count
    await this.chartRepository.increment(
      { template_id: dto.chart_id },
      'usage_count',
      1,
    );

    // Send notification - look up user by memberId
    const user = await this.userRepository.findOne({
      where: { memberId: String(member.id) },
    });
    if (user) {
      await this.notificationsService.sendChartAssignedNotification(
        user.userId,
        chart.title,
        member.fullName,
      );
    }

    return saved;
  }

  async findAll(options?: {
    memberId?: number;
    chartId?: string;
    status?: ChartAssignmentStatus;
  }) {
    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.chart', 'chart')
      .leftJoinAndSelect('a.member', 'member')
      .orderBy('a.assigned_at', 'DESC');

    if (options?.memberId) {
      queryBuilder.andWhere('a.memberId = :memberId', {
        memberId: options.memberId,
      });
    }
    if (options?.chartId) {
      queryBuilder.andWhere('a.chart_id = :chartId', {
        chartId: options.chartId,
      });
    }
    if (options?.status) {
      queryBuilder.andWhere('a.status = :status', { status: options.status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: { assignment_id: id },
      relations: ['chart', 'member'],
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async update(id: string, dto: UpdateChartAssignmentDto) {
    const assignment = await this.findOne(id);

    if (dto.status) {
      assignment.status = dto.status;
    }
    if (dto.end_date) {
      assignment.end_date = new Date(dto.end_date);
    }
    if (dto.completion_percent !== undefined) {
      assignment.completion_percent = Math.min(
        100,
        Math.max(0, dto.completion_percent),
      );
    }

    return this.assignmentRepository.save(assignment);
  }

  async addSubstitution(
    id: string,
    substitution: {
      original_exercise: string;
      substituted_exercise: string;
      reason?: string;
    },
  ) {
    const assignment = await this.findOne(id);

    if (!assignment.member_substitutions) {
      assignment.member_substitutions = [];
    }

    assignment.member_substitutions.push({
      ...substitution,
      date: new Date(),
    });

    return this.assignmentRepository.save(assignment);
  }

  async recordExerciseCompletion(
    id: string,
    exerciseName: string,
    completedSets: number,
    completedReps: number[],
  ) {
    const assignment = await this.findOne(id);

    if (!assignment.customizations) {
      assignment.customizations = {
        skipped_exercises: [],
        modified_sets: [],
        modified_reps: [],
        notes: '',
      };
    }

    // Update last activity timestamp
    assignment.last_activity_at = new Date();

    // Calculate simple progress (could be enhanced)
    assignment.completion_percent = Math.min(
      100,
      assignment.completion_percent + (completedSets > 0 ? 5 : 0),
    );

    return this.assignmentRepository.save(assignment);
  }

  async cancel(id: string) {
    const assignment = await this.findOne(id);
    assignment.status = ChartAssignmentStatus.CANCELLED;
    return this.assignmentRepository.save(assignment);
  }

  async delete(id: string) {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
    return { success: true, message: 'Assignment deleted' };
  }

  async getMemberActiveAssignments(memberId: number) {
    return this.assignmentRepository.find({
      where: {
        memberId,
        status: ChartAssignmentStatus.ACTIVE,
      },
      relations: ['chart'],
      order: { assigned_at: 'DESC' },
    });
  }
}
