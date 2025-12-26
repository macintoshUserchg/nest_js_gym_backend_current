import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between, In, LessThan } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { Branch } from '../entities/branch.entity';
import { Member } from '../entities/members.entity';
import { Trainer } from '../entities/trainers.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Attendance } from '../entities/attendance.entity';
import { Class } from '../entities/classes.entity';
import { MemberTrainerAssignment } from '../entities/member_trainer_assignments.entity';
import { Invoice } from '../entities/invoices.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Gym)
    private gymsRepo: Repository<Gym>,
    @InjectRepository(Branch)
    private branchesRepo: Repository<Branch>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(Trainer)
    private trainersRepo: Repository<Trainer>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Class)
    private classesRepo: Repository<Class>,
    @InjectRepository(MemberTrainerAssignment)
    private assignmentsRepo: Repository<MemberTrainerAssignment>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
    @InjectRepository(PaymentTransaction)
    private paymentsRepo: Repository<PaymentTransaction>,
  ) {}

  async getGymDashboard(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map((b) => b.branchId);
    const mainBranch = gym.branches.find((b) => b.mainBranch);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Member Analytics
    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId: In(branchIds) } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId: In(branchIds) } },
    });

    const expiringToday =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getCount()
        : 0;

    const expiring3Days =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :threeDaysFromNow', {
              threeDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getCount()
        : 0;

    const membersWithBirthdayToday =
      branchIds.length > 0
        ? await this.membersRepo
            .createQueryBuilder('member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
              month: today.getMonth() + 1,
            })
            .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
              day: today.getDate(),
            })
            .getCount()
        : 0;

    const amountDueMembers =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getCount()
        : 0;

    const totalAmountDueResult =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .select('SUM(invoice.total_amount)', 'total')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getRawOne()
        : { total: 0 };

    const totalAmountDue = parseFloat(totalAmountDueResult?.total || '0');

    // Attendance, Trainer, Class counts
    const attendanceToday =
      branchIds.length > 0
        ? await this.attendanceRepo.count({
            where: {
              date: Between(today, tomorrow),
              branch: { branchId: In(branchIds) },
            },
          })
        : 0;

    const totalTrainers =
      branchIds.length > 0
        ? await this.trainersRepo.count({
            where: { branch: { branchId: In(branchIds) } },
          })
        : 0;

    const totalClasses =
      branchIds.length > 0
        ? await this.classesRepo.count({
            where: { branch: { branchId: In(branchIds) } },
          })
        : 0;

    // Payment Analytics for Today
    const paymentsToday =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoin('payment.invoice', 'invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('payment.created_at >= :today', { today })
            .andWhere('payment.created_at < :tomorrow', { tomorrow })
            .andWhere('payment.status = :status', { status: 'completed' })
            .getMany()
        : [];

    const cashPayments = paymentsToday.filter(
      (p) => p.method === 'cash',
    ).length;
    const onlinePayments = paymentsToday.filter(
      (p) => p.method !== 'cash',
    ).length;

    // Admission, Renewal, Due Paid counts
    const admissionCountToday =
      branchIds.length > 0
        ? await this.membersRepo
            .createQueryBuilder('member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.createdAt >= :today', { today })
            .andWhere('member.createdAt < :tomorrow', { tomorrow })
            .getCount()
        : 0;

    const renewalCountToday =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('subscription.startDate >= :today', { today })
            .andWhere('subscription.startDate < :tomorrow', { tomorrow })
            .andWhere('member.createdAt < :today', { today })
            .getCount()
        : 0;

    const duePaidByMemberCountToday =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoin('payment.invoice', 'invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('payment.created_at >= :today', { today })
            .andWhere('payment.created_at < :tomorrow', { tomorrow })
            .andWhere('payment.status = :status', { status: 'completed' })
            .andWhere('invoice.status = :invoiceStatus', {
              invoiceStatus: 'paid',
            })
            .getCount()
        : 0;

    // Recent Payments
    const recentPayments =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoinAndSelect('payment.invoice', 'invoice')
            .innerJoinAndSelect('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .orderBy('payment.created_at', 'DESC')
            .take(10)
            .getMany()
        : [];

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
        email: payment.invoice.member.email,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
        status: payment.invoice.status,
      },
    }));

    // Revenue Analytics
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    const currentMonthRevenueResult =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoin('payment.invoice', 'invoice')
            .innerJoin('invoice.member', 'member')
            .select('SUM(payment.amount)', 'total')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('payment.created_at >= :firstDayOfCurrentMonth', {
              firstDayOfCurrentMonth,
            })
            .andWhere('payment.created_at < :firstDayOfNextMonth', {
              firstDayOfNextMonth,
            })
            .andWhere('payment.status = :status', { status: 'completed' })
            .getRawOne()
        : { total: 0 };

    const currentMonthRevenue = parseFloat(
      currentMonthRevenueResult?.total || '0',
    );

    const lastMonthRevenueResult =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoin('payment.invoice', 'invoice')
            .innerJoin('invoice.member', 'member')
            .select('SUM(payment.amount)', 'total')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('payment.created_at >= :firstDayOfLastMonth', {
              firstDayOfLastMonth,
            })
            .andWhere('payment.created_at < :firstDayOfCurrentMonth', {
              firstDayOfCurrentMonth,
            })
            .andWhere('payment.status = :status', { status: 'completed' })
            .getRawOne()
        : { total: 0 };

    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.total || '0');

    // Calculate revenue percentage change
    let revenuePercentageChange = 0;
    let revenueChangeType = 'no_change';

    if (lastMonthRevenue > 0) {
      revenuePercentageChange =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChangeType =
        revenuePercentageChange > 0
          ? 'increase'
          : revenuePercentageChange < 0
            ? 'decrease'
            : 'no_change';
    } else if (currentMonthRevenue > 0) {
      revenuePercentageChange = 100;
      revenueChangeType = 'increase';
    }

    // Active Members Analytics
    const currentMonthActiveMembers =
      branchIds.length > 0
        ? await this.membersRepo.count({
            where: {
              isActive: true,
              branch: { branchId: In(branchIds) },
              createdAt: MoreThanOrEqual(firstDayOfCurrentMonth),
            },
          })
        : 0;

    const lastMonthActiveMembers =
      branchIds.length > 0
        ? await this.membersRepo.count({
            where: {
              isActive: true,
              branch: { branchId: In(branchIds) },
              createdAt: Between(firstDayOfLastMonth, firstDayOfCurrentMonth),
            },
          })
        : 0;

    // Calculate active members percentage change
    let activeMembersPercentageChange = 0;
    let activeMembersChangeType = 'no_change';

    if (lastMonthActiveMembers > 0) {
      activeMembersPercentageChange =
        ((currentMonthActiveMembers - lastMonthActiveMembers) /
          lastMonthActiveMembers) *
        100;
      activeMembersChangeType =
        activeMembersPercentageChange > 0
          ? 'increase'
          : activeMembersPercentageChange < 0
            ? 'decrease'
            : 'no_change';
    } else if (currentMonthActiveMembers > 0) {
      activeMembersPercentageChange = 100;
      activeMembersChangeType = 'increase';
    }

    // Get member IDs for expiring today and next 3 days
    const expiringTodayMembers =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .select('member.id', 'id')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getRawMany()
        : [];

    const expiring3DaysMembers =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .select('member.id', 'id')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :threeDaysFromNow', {
              threeDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getRawMany()
        : [];

    // Get member IDs for birthdays today
    const birthdayTodayMembers =
      branchIds.length > 0
        ? await this.membersRepo
            .createQueryBuilder('member')
            .select('member.id', 'id')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
              month: today.getMonth() + 1,
            })
            .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
              day: today.getDate(),
            })
            .getRawMany()
        : [];

    // Get dues information with member IDs and amounts
    const duesMembers =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .select(['member.id', 'invoice.total_amount'])
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getRawMany()
        : [];

    return {
      gym: {
        id: gym.gymId,
        name: gym.name,
        branchId: mainBranch?.branchId,
        branchName: mainBranch?.name,
      },
      today: {
        payments: {
          online: onlinePayments,
          cash: cashPayments,
        },
        attendance: attendanceToday,
        admissions: admissionCountToday,
        renewals: renewalCountToday,
        duesPaid: duePaidByMemberCountToday,
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiring: {
          today: {
            count: expiringToday,
            members: expiringTodayMembers.map((m) => m.id),
          },
          next3Days: {
            count: expiring3Days,
            members: expiring3DaysMembers.map((m) => m.id),
          },
        },
        birthdays: {
          today: {
            count: membersWithBirthdayToday,
            members: birthdayTodayMembers.map((m) => m.id),
          },
        },
        dues: {
          count: amountDueMembers,
          totalAmount: totalAmountDue,
          members: duesMembers.map((d) => ({
            id: d.member_id,
            amount: parseFloat(d.total_amount),
          })),
        },
      },
      resources: {
        trainers: totalTrainers,
        classes: totalClasses,
      },
      revenue: {
        current: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: {
          percent: revenuePercentageChange,
          type: revenueChangeType,
        },
      },
      memberGrowth: {
        current: currentMonthActiveMembers,
        lastMonth: lastMonthActiveMembers,
        change: {
          percent: activeMembersPercentageChange,
          type: activeMembersChangeType,
        },
      },
      recentPayments: formattedPayments,
    };
  }

  /**
   * Get member analytics for a gym
   *
   * @param gymId - The ID of the gym to get member analytics for
   * @returns Object containing gym information and member analytics
   *
   * @example
   * // Request
   * GET /analytics/gym/{gymId}/members
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "members": {
   *     "total": 150,
   *     "active": 120,
   *     "inactive": 30,
   *     "expiringToday": 5,
   *     "amount_due_members": 8,
   *     "total_amount_due": 2500.00,
   *     "expiring3days": 12,
   *     "birthday_today": 2
   *   }
   * }
   */
  async getGymMemberAnalytics(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map((b) => b.branchId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Member Analytics
    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId: In(branchIds) } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId: In(branchIds) } },
    });

    const expiringToday =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getCount()
        : 0;

    const expiring3Days =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.member', 'member')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :threeDaysFromNow', {
              threeDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .getCount()
        : 0;

    const membersWithBirthdayToday =
      branchIds.length > 0
        ? await this.membersRepo
            .createQueryBuilder('member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
              month: today.getMonth() + 1,
            })
            .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
              day: today.getDate(),
            })
            .getCount()
        : 0;

    const amountDueMembers =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getCount()
        : 0;

    const totalAmountDueResult =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .select('SUM(invoice.total_amount)', 'total')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getRawOne()
        : { total: 0 };

    const totalAmountDue = parseFloat(totalAmountDueResult?.total || '0');

    return {
      gymId: gym.gymId,
      gymName: gym.name,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiringToday,
        amount_due_members: amountDueMembers,
        total_amount_due: totalAmountDue,
        expiring3days: expiring3Days,
        birthday_today: membersWithBirthdayToday,
      },
    };
  }

  /**
   * Get member analytics for a specific branch
   *
   * @param branchId - The ID of the branch to get member analytics for
   * @returns Object containing gym information, branch details, and member analytics
   *
   * @example
   * // Request
   * GET /analytics/branch/{branchId}/members
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "branchId": "branch-456",
   *   "branchName": "Downtown Branch",
   *   "members": {
   *     "total": 75,
   *     "active": 60,
   *     "inactive": 15,
   *     "expiringToday": 2,
   *     "amount_due_members": 4,
   *     "expiring3days": 6,
   *     "birthday_today": 1
   *   }
   * }
   */
  async getBranchMemberAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const gymId = branch.gym?.gymId;
    const gymName = branch.gym?.name;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Member Analytics
    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId } },
    });

    const expiringToday = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tomorrow', { tomorrow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getCount();

    const expiring3Days = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :threeDaysFromNow', {
        threeDaysFromNow,
      })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getCount();

    // Members with birthdays today
    const membersWithBirthdayToday = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
        month: today.getMonth() + 1,
      })
      .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
        day: today.getDate(),
      })
      .getCount();

    // Amount due members (invoices with status 'pending')
    const amountDueMembers = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('invoice.status = :status', { status: 'pending' })
      .getCount();

    return {
      gymId,
      gymName,
      branchId,
      branchName: branch.name,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiringToday,
        amount_due_members: amountDueMembers,
        expiring3days: expiring3Days,
        birthday_today: membersWithBirthdayToday,
      },
    };
  }

  // Attendance Analytics Methods
  /**
   * Get attendance analytics for a gym
   *
   * @param gymId - The ID of the gym to get attendance analytics for
   * @returns Object containing gym information and today's attendance count
   *
   * @example
   * // Request
   * GET /analytics/gym/{gymId}/attendance
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "branchId": "branch-456",
   *   "branchName": "Main Branch",
   *   "attendance": {
   *     "today": 42
   *   }
   * }
   */
  async getGymAttendanceAnalytics(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map((b) => b.branchId);
    const mainBranch = gym.branches.find((b) => b.mainBranch);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Attendance Analytics
    const attendanceToday =
      branchIds.length > 0
        ? await this.attendanceRepo.count({
            where: {
              date: Between(today, tomorrow),
              branch: { branchId: In(branchIds) },
            },
          })
        : 0;

    return {
      gymId: gym.gymId,
      gymName: gym.name,
      branchId: mainBranch?.branchId,
      branchName: mainBranch?.name,
      attendance: {
        today: attendanceToday,
      },
    };
  }

  /**
   * Get attendance analytics for a specific branch
   *
   * @param branchId - The ID of the branch to get attendance analytics for
   * @returns Object containing gym information, branch details, and today's attendance count
   *
   * @example
   * // Request
   * GET /analytics/branch/{branchId}/attendance
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "branchId": "branch-456",
   *   "branchName": "Downtown Branch",
   *   "attendance": {
   *     "today": 25
   *   }
   * }
   */
  async getBranchAttendanceAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const gymId = branch.gym?.gymId;
    const gymName = branch.gym?.name;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Attendance Today
    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
      },
    });

    return {
      gymId,
      gymName,
      branchId,
      branchName: branch.name,
      attendance: {
        today: attendanceToday,
      },
    };
  }

  // Payment Analytics Methods
  /**
   * Get 10 most recent payment transactions for a gym
   *
   * @param gymId - The ID of the gym to get recent payments for
   * @returns Object containing gym information and array of recent payment transactions
   *
   * @example
   * // Request
   * GET /analytics/gym/{gymId}/payments/recent
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "branchId": "branch-456",
   *   "branchName": "Main Branch",
   *   "recentPayments": [
   *     {
   *       "transactionId": "txn-001",
   *       "amount": 1200.00,
   *       "method": "credit_card",
   *       "status": "completed",
   *       "referenceNumber": "REF-12345",
   *       "notes": "Annual membership fee",
   *       "createdAt": "2023-12-20T10:30:00Z",
   *       "member": {
   *         "id": "member-001",
   *         "fullName": "John Doe",
   *         "email": "john@example.com"
   *       },
   *       "invoice": {
   *         "invoiceId": "inv-001",
   *         "totalAmount": 1200.00,
   *         "status": "paid"
   *       }
   *     }
   *   ]
   * }
   */
  async getGymRecentPayments(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map((b) => b.branchId);
    const mainBranch = gym.branches.find((b) => b.mainBranch);

    // Recent Payments
    const recentPayments =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoinAndSelect('payment.invoice', 'invoice')
            .innerJoinAndSelect('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .orderBy('payment.created_at', 'DESC')
            .take(10)
            .getMany()
        : [];

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
        email: payment.invoice.member.email,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
        status: payment.invoice.status,
      },
    }));

    return {
      gymId: gym.gymId,
      gymName: gym.name,
      branchId: mainBranch?.branchId,
      branchName: mainBranch?.name,
      recentPayments: formattedPayments,
    };
  }

  /**
   * Get 10 most recent payment transactions for a specific branch
   *
   * @param branchId - The ID of the branch to get recent payments for
   * @returns Object containing gym information, branch details, and array of recent payment transactions
   *
   * @example
   * // Request
   * GET /analytics/branch/{branchId}/payments/recent
   *
   * @example
   * // Response
   * {
   *   "gymId": "gym-123",
   *   "gymName": "Fitness World",
   *   "branchId": "branch-456",
   *   "branchName": "Downtown Branch",
   *   "recentPayments": [
   *     {
   *       "transactionId": "txn-002",
   *       "amount": 800.00,
   *       "method": "cash",
   *       "status": "completed",
   *       "referenceNumber": "REF-67890",
   *       "notes": "Monthly membership renewal",
   *       "createdAt": "2023-12-21T14:15:00Z",
   *       "member": {
   *         "id": "member-002",
   *         "fullName": "Jane Smith",
   *         "email": "jane@example.com"
   *       },
   *       "invoice": {
   *         "invoiceId": "inv-002",
   *         "totalAmount": 800.00,
   *         "status": "paid"
   *       }
   *     }
   *   ]
   * }
   */
  async getBranchRecentPayments(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const gymId = branch.gym?.gymId;
    const gymName = branch.gym?.name;

    // Recent Payments (Last 10)
    const recentPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .innerJoinAndSelect('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .orderBy('payment.created_at', 'DESC')
      .take(10)
      .getMany();

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
        email: payment.invoice.member.email,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
        status: payment.invoice.status,
      },
    }));

    return {
      gymId,
      gymName,
      branchId,
      branchName: branch.name,
      recentPayments: formattedPayments,
    };
  }

  // Other methods remain unchanged...
  async getBranchDashboard(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const gymId = branch.gym?.gymId;
    const gymName = branch.gym?.name;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Member Analytics
    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId } },
    });

    const expiringToday = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tomorrow', { tomorrow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getCount();

    const expiring3Days = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :threeDaysFromNow', {
        threeDaysFromNow,
      })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getCount();

    // Members with birthdays today
    const membersWithBirthdayToday = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
        month: today.getMonth() + 1,
      })
      .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
        day: today.getDate(),
      })
      .getCount();

    // Amount due members (invoices with status 'pending')
    const amountDueMembers = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('invoice.status = :status', { status: 'pending' })
      .getCount();

    // Attendance Today
    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
      },
    });

    // Payment Analytics for Today
    const paymentsToday = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('payment.created_at >= :today', { today })
      .andWhere('payment.created_at < :tomorrow', { tomorrow })
      .andWhere('payment.status = :status', { status: 'completed' })
      .getMany();

    const cashPayments = paymentsToday.filter(
      (p) => p.method === 'cash',
    ).length;
    const onlinePayments = paymentsToday.filter(
      (p) => p.method !== 'cash',
    ).length;

    // Admission count today (new members created today)
    const admissionCountToday = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('member.createdAt >= :today', { today })
      .andWhere('member.createdAt < :tomorrow', { tomorrow })
      .getCount();

    // Renewal count today (subscriptions created today for existing members)
    const renewalCountToday = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('subscription.startDate >= :today', { today })
      .andWhere('subscription.startDate < :tomorrow', { tomorrow })
      .andWhere('member.createdAt < :today', { today })
      .getCount();

    // Due paid by member count today (invoices paid today that were previously pending)
    const duePaidByMemberCountToday = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('payment.created_at >= :today', { today })
      .andWhere('payment.created_at < :tomorrow', { tomorrow })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('invoice.status = :invoiceStatus', { invoiceStatus: 'paid' })
      .getCount();

    // Trainer Analytics
    const totalTrainers = await this.trainersRepo.count({
      where: { branch: { branchId } },
    });

    // Class Analytics
    const totalClasses = await this.classesRepo.count({
      where: { branch: { branchId } },
    });

    // Recent Payments (Last 10)
    const recentPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .innerJoinAndSelect('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .orderBy('payment.created_at', 'DESC')
      .take(10)
      .getMany();

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
        email: payment.invoice.member.email,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
        status: payment.invoice.status,
      },
    }));

    // Get member IDs for expiring today and next 3 days (for this specific branch)
    const expiringTodayMembers = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .select('member.id', 'id')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tomorrow', { tomorrow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getRawMany();

    const expiring3DaysMembers = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .select('member.id', 'id')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :threeDaysFromNow', {
        threeDaysFromNow,
      })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .getRawMany();

    // Get member IDs for birthdays today (for this specific branch)
    const birthdayTodayMembers = await this.membersRepo
      .createQueryBuilder('member')
      .select('member.id', 'id')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
        month: today.getMonth() + 1,
      })
      .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
        day: today.getDate(),
      })
      .getRawMany();

    // Get dues information with member IDs and amounts (for this specific branch)
    const duesMembers = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .select(['member.id', 'invoice.total_amount'])
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('invoice.status = :status', { status: 'pending' })
      .getRawMany();

    // Revenue Analytics
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    const currentMonthRevenueResult = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .select('SUM(payment.amount)', 'total')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('payment.created_at >= :firstDayOfCurrentMonth', {
        firstDayOfCurrentMonth,
      })
      .andWhere('payment.created_at < :firstDayOfNextMonth', {
        firstDayOfNextMonth,
      })
      .andWhere('payment.status = :status', { status: 'completed' })
      .getRawOne();

    const currentMonthRevenue = parseFloat(
      currentMonthRevenueResult?.total || '0',
    );

    const lastMonthRevenueResult = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .select('SUM(payment.amount)', 'total')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('payment.created_at >= :firstDayOfLastMonth', {
        firstDayOfLastMonth,
      })
      .andWhere('payment.created_at < :firstDayOfCurrentMonth', {
        firstDayOfCurrentMonth,
      })
      .andWhere('payment.status = :status', { status: 'completed' })
      .getRawOne();

    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.total || '0');

    // Calculate revenue percentage change
    let revenuePercentageChange = 0;
    let revenueChangeType = 'no_change';

    if (lastMonthRevenue > 0) {
      revenuePercentageChange =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChangeType =
        revenuePercentageChange > 0
          ? 'increase'
          : revenuePercentageChange < 0
            ? 'decrease'
            : 'no_change';
    } else if (currentMonthRevenue > 0) {
      revenuePercentageChange = 100;
      revenueChangeType = 'increase';
    }

    // Active Members Analytics
    const currentMonthActiveMembers = await this.membersRepo.count({
      where: {
        isActive: true,
        branch: { branchId },
        createdAt: MoreThanOrEqual(firstDayOfCurrentMonth),
      },
    });

    const lastMonthActiveMembers = await this.membersRepo.count({
      where: {
        isActive: true,
        branch: { branchId },
        createdAt: Between(firstDayOfLastMonth, firstDayOfCurrentMonth),
      },
    });

    // Calculate active members percentage change
    let activeMembersPercentageChange = 0;
    let activeMembersChangeType = 'no_change';

    if (lastMonthActiveMembers > 0) {
      activeMembersPercentageChange =
        ((currentMonthActiveMembers - lastMonthActiveMembers) /
          lastMonthActiveMembers) *
        100;
      activeMembersChangeType =
        activeMembersPercentageChange > 0
          ? 'increase'
          : activeMembersPercentageChange < 0
            ? 'decrease'
            : 'no_change';
    } else if (currentMonthActiveMembers > 0) {
      activeMembersPercentageChange = 100;
      activeMembersChangeType = 'increase';
    }

    // Get total amount due
    const totalAmountDueResult = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .select('SUM(invoice.total_amount)', 'total')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('invoice.status = :status', { status: 'pending' })
      .getRawOne();

    const totalAmountDue = parseFloat(totalAmountDueResult?.total || '0');

    return {
      gym: {
        id: gymId,
        name: gymName,
        branchId: branchId,
        branchName: branch.name,
      },
      today: {
        payments: {
          online: onlinePayments,
          cash: cashPayments,
        },
        attendance: attendanceToday,
        admissions: admissionCountToday,
        renewals: renewalCountToday,
        duesPaid: duePaidByMemberCountToday,
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiring: {
          today: {
            count: expiringToday,
            members: expiringTodayMembers.map((m) => m.id),
          },
          next3Days: {
            count: expiring3Days,
            members: expiring3DaysMembers.map((m) => m.id),
          },
        },
        birthdays: {
          today: {
            count: membersWithBirthdayToday,
            members: birthdayTodayMembers.map((m) => m.id),
          },
        },
        dues: {
          count: amountDueMembers,
          totalAmount: totalAmountDue,
          members: duesMembers.map((d) => ({
            id: d.member_id,
            amount: parseFloat(d.total_amount),
          })),
        },
      },
      resources: {
        trainers: totalTrainers,
        classes: totalClasses,
      },
      revenue: {
        current: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: {
          percent: revenuePercentageChange,
          type: revenueChangeType,
        },
      },
      memberGrowth: {
        current: currentMonthActiveMembers,
        lastMonth: lastMonthActiveMembers,
        change: {
          percent: activeMembersPercentageChange,
          type: activeMembersChangeType,
        },
      },
      recentPayments: formattedPayments,
    };
  }
}
