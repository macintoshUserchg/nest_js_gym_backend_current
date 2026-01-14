import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, In } from 'typeorm';
import { Member } from '../entities/members.entity';
import { Branch } from '../entities/branch.entity';
import { Class } from '../entities/classes.entity';
import { User } from '../entities/users.entity';
import { Role } from '../entities/roles.entity';
import { Attendance } from '../entities/attendance.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AdminUpdateMemberDto } from './dto/admin-update-member.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(PaymentTransaction)
    private paymentsRepo: Repository<PaymentTransaction>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    @InjectRepository(MembershipPlan)
    private membershipPlansRepo: Repository<MembershipPlan>,
    private dataSource: DataSource,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    // Get branch (required)
    const branch = await this.branchesRepo.findOne({
      where: { branchId: createMemberDto.branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${createMemberDto.branchId} not found`,
      );
    }

    // Get membership plan (required)
    const membershipPlan = await this.membershipPlansRepo.findOne({
      where: { id: createMemberDto.membershipPlanId },
    });
    if (!membershipPlan) {
      throw new NotFoundException(
        `Membership plan with ID ${createMemberDto.membershipPlanId} not found`,
      );
    }

    // Get member role
    const memberRole = await this.rolesRepo.findOne({
      where: { name: 'MEMBER' },
    });
    if (!memberRole) {
      throw new NotFoundException('MEMBER role not found in the system');
    }

    // Prepare entities (outside transaction)
    const memberEntity = this.membersRepo.create({
      fullName: createMemberDto.fullName,
      email: createMemberDto.email,
      phone: createMemberDto.phone,
      gender: createMemberDto.gender,
      dateOfBirth: createMemberDto.dateOfBirth
        ? new Date(createMemberDto.dateOfBirth)
        : undefined,
      addressLine1: createMemberDto.addressLine1,
      addressLine2: createMemberDto.addressLine2,
      city: createMemberDto.city,
      state: createMemberDto.state,
      postalCode: createMemberDto.postalCode,
      avatarUrl: createMemberDto.avatarUrl,
      emergencyContactName: createMemberDto.emergencyContactName,
      emergencyContactPhone: createMemberDto.emergencyContactPhone,
      isActive: createMemberDto.isActive ?? true,
      attachmentUrl: createMemberDto.attachmentUrl,
      freezMember: createMemberDto.freezMember ?? false,
      branch,
      branchBranchId: branch?.branchId,
    });

    const defaultPassword = 'pass@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = this.usersRepo.create({
      email: createMemberDto.email,
      passwordHash: hashedPassword,
      role: memberRole,
      gym: branch?.gym,
      branch: branch,
      memberId: '0', // Temporary, will be updated after member save
    });

    // Create membership subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + membershipPlan.durationInDays);

    const subscriptionEntity = this.subscriptionsRepo.create({
      member: memberEntity, // Will be replaced with saved member in transaction
      plan: membershipPlan,
      startDate,
      endDate,
      isActive: true,
      selectedClassIds: createMemberDto.selectedClassIds,
    });

    // Wrap all saves in transaction
    const savedMember = await this.dataSource.transaction(async (manager) => {
      try {
        // Check if member with email already exists (inside transaction for row-level lock)
        const existingMember = await manager.findOne(Member, {
          where: { email: createMemberDto.email },
        });
        if (existingMember) {
          throw new ConflictException('Member with this email already exists');
        }

        // Check if user with email already exists
        const existingUser = await manager.findOne(User, {
          where: { email: createMemberDto.email },
        });
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        // Proceed with creation - protected by transaction
        const savedMemberEntity = await manager.save(memberEntity);

        // Update user with actual member ID
        user.memberId = savedMemberEntity.id.toString();
        await manager.save(user);

        // Update subscription with saved member
        subscriptionEntity.member = savedMemberEntity;
        const sub = await manager.save(subscriptionEntity);

        // Update member with subscription ID
        savedMemberEntity.subscriptionId = sub.id;
        return await manager.save(savedMemberEntity);
      } catch (error: any) {
        // Handle unique constraint violation (PostgreSQL error code 23505)
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          throw new ConflictException('Member with this email already exists');
        }
        throw error;
      }
    });

    // Fetch member with full relations for response
    const member = await this.membersRepo.findOne({
      where: { id: savedMember.id },
      relations: [
        'subscription',
        'subscription.plan',
        'branch',
        'branch.gym',
      ],
    });

    // Fetch classes from selectedClassIds
    if (member?.subscription?.selectedClassIds?.length) {
      const classes = await this.classesRepo.find({
        where: { class_id: In(member.subscription.selectedClassIds) },
      });
      // Map class details for response
      const subscriptionWithClasses = {
        ...member.subscription,
        classes: classes.map((c) => ({
          classId: c.class_id,
          name: c.name,
          description: c.description,
          timings: c.timings,
          recurrenceType: c.recurrence_type,
          daysOfWeek: c.days_of_week,
        })),
      };
      member.subscription = subscriptionWithClasses as any;
    }

    return member;
  }

  async findAll(branchId?: string, status?: string, search?: string) {
    const queryBuilder = this.membersRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.branch', 'branch')
      .leftJoinAndSelect('member.subscription', 'subscription');

    if (branchId) {
      queryBuilder.andWhere('branch.branchId = :branchId', { branchId });
    }

    if (status) {
      queryBuilder.andWhere('member.isActive = :status', {
        status: status === 'active',
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(member.fullName ILIKE :search OR member.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const member = await this.membersRepo.findOne({
      where: { id },
      relations: ['branch', 'subscription'],
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existingMember = await this.membersRepo.findOne({
        where: { email: updateMemberDto.email },
      });
      if (existingMember) {
        throw new ConflictException('Member with this email already exists');
      }
    }

    Object.assign(member, updateMemberDto);
    return this.membersRepo.save(member);
  }

  async adminUpdate(id: number, updateMemberDto: AdminUpdateMemberDto) {
    const member = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existingMember = await this.membersRepo.findOne({
        where: { email: updateMemberDto.email },
      });
      if (existingMember) {
        throw new ConflictException('Member with this email already exists');
      }
    }

    // If branchId is being updated, verify branch exists
    if (updateMemberDto.branchId) {
      const branch = await this.branchesRepo.findOne({
        where: { branchId: updateMemberDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateMemberDto.branchId} not found`,
        );
      }
      member.branch = branch;
      member.branchBranchId = branch.branchId;
    }

    Object.assign(member, updateMemberDto);
    return this.membersRepo.save(member);
  }

  async remove(id: number) {
    const member = await this.findOne(id);
    return this.membersRepo.remove(member);
  }

  async findByBranch(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.membersRepo.find({
      where: { branch: { branchId } },
      relations: ['branch', 'subscription'],
    });
  }

  async getMemberDashboard(memberId: number) {
    const member = await this.findOne(memberId);

    // Get subscription details
    const subscription = member.subscription;

    // Get attendance count for current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    const attendanceCount =
      (await this.attendanceRepo?.count({
        where: {
          member: { id: memberId },
          date: Between(firstDayOfMonth, lastDayOfMonth),
        },
      })) || 0;

    // Get payment history (last 5 payments)
    const paymentHistory =
      (await this.paymentsRepo?.find({
        where: {
          invoice: {
            member: { id: memberId },
          },
        },
        relations: ['invoice'],
        order: { created_at: 'DESC' },
        take: 5,
      })) || [];

    return {
      member: {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        isActive: member.isActive,
        attachmentUrl: member.attachmentUrl,
        freezMember: member.freezMember,
        branch: member.branch
          ? {
              branchId: member.branch.branchId,
              name: member.branch.name,
            }
          : null,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan?.name,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            status: subscription.isActive ? 'active' : 'inactive',
          }
        : null,
      attendance: {
        currentMonthCount: attendanceCount,
      },
      paymentHistory: paymentHistory.map((payment) => ({
        transactionId: payment.transaction_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.created_at,
        invoiceId: payment.invoice.invoice_id,
      })),
    };
  }
}
