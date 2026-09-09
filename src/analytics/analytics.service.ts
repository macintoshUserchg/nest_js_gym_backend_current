import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  In,
  SelectQueryBuilder,
  ObjectLiteral,
} from 'typeorm';
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

  private startOfToday(date: Date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private applyEffectiveActiveSubscriptionFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    today: Date,
  ) {
    return queryBuilder
      .andWhere(`${alias}.isActive = :subscriptionIsActive`, {
        subscriptionIsActive: true,
      })
      .andWhere(`${alias}.endDate >= :activeSubscriptionFloor`, {
        activeSubscriptionFloor: today,
      });
  }

  private async countEffectiveActiveMembers(
    params: { branchId: string } | { branchIds: string[] },
  ) {
    const today = this.startOfToday();
    const query = this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .select('COUNT(DISTINCT member.id)', 'count')
      .andWhere('member.isActive = :memberIsActive', { memberIsActive: true });

    this.applyEffectiveActiveSubscriptionFilter(query, 'subscription', today);

    if ('branchId' in params) {
      query.andWhere('member.branchBranchId = :branchId', {
        branchId: params.branchId,
      });
    } else if (params.branchIds.length === 0) {
      return 0;
    } else {
      query.andWhere('member.branchBranchId IN (:...branchIds)', {
        branchIds: params.branchIds,
      });
    }

    const result = await query.getRawOne<{ count?: string }>();
    return parseInt(result?.count || '0', 10);
  }

  /**
   * OPTIMIZED: Get gym dashboard analytics with minimal response
   * Use query parameters to control response size:
   * - includeDetails=false (default) for minimal response
   * - maxTrainers=5, maxClasses=5 (default limits)
   * - maxRecentPayments=3 (default)
   */
  async getGymDashboard(
    gymId: string,
    options?: {
      includeDetails?: boolean;
      maxTrainers?: number;
      maxClasses?: number;
      maxRecentPayments?: number;
    },
  ) {
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
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    // Options with defaults for performance
    const {
      includeDetails = false,
      maxTrainers = 3,
      maxClasses = 3,
      maxRecentPayments = 5,
    } = options || {};

    // Core Analytics - Fast queries only
    const [
      totalMembers,
      activeMembers,
      expiringToday,
      expiring10Days,
      membersWithBirthdayToday,
      amountDueMembers,
      totalAmountDue,
      attendanceToday,
      totalTrainers,
      totalClasses,
    ] = await Promise.all([
      this.membersRepo.count({
        where: { branch: { branchId: In(branchIds) } },
      }),
      this.countEffectiveActiveMembers({ branchIds }),
      branchIds.length > 0
        ? this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
            .getCount()
        : 0,
      branchIds.length > 0
        ? this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :threeDaysFromNow', {
              threeDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
            .getCount()
        : 0,
      branchIds.length > 0
        ? this.membersRepo
            .createQueryBuilder('member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
              month: today.getMonth() + 1,
            })
            .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
              day: today.getDate(),
            })
            .getCount()
        : 0,
      branchIds.length > 0
        ? this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getCount()
        : 0,
      branchIds.length > 0
        ? this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .select('SUM(invoice.total_amount)', 'total')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .getRawOne()
        : { total: 0 },
      branchIds.length > 0
        ? this.attendanceRepo.count({
            where: {
              date: Between(today, tomorrow),
              branch: { branchId: In(branchIds) },
            },
          })
        : 0,
      this.trainersRepo.count({
        where: { branch: { branchId: In(branchIds) } },
      }),
      this.classesRepo.count({
        where: { branch: { branchId: In(branchIds) } },
      }),
    ]);

    // Get member IDs with pending dues separately
    const duesMemberIds =
      branchIds.length > 0
        ? await this.invoicesRepo
            .createQueryBuilder('invoice')
            .innerJoin('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('invoice.status = :status', { status: 'pending' })
            .select('DISTINCT member.id', 'id')
            .getRawMany()
            .then((results) => results.map((result) => result.id))
        : [];

    // Get member IDs for birthdays today
    const birthdayMemberIds =
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
            .select('member.id')
            .getMany()
            .then((results) => results.map((result) => result.id))
        : [];

    // Get member IDs for expiring today
    const expiringTodayMemberIds =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
            .select('DISTINCT member.id', 'id')
            .getRawMany()
            .then((results) => results.map((result) => result.id))
        : [];

    // Get member IDs for expiring in next 10 days
    const expiring10DaysMemberIds =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tenDaysFromNow', {
              tenDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
            .select('DISTINCT member.id', 'id')
            .getRawMany()
            .then((results) => results.map((result) => result.id))
        : [];

    const totalAmountDueValue = parseFloat(totalAmountDue?.total || '0');

    // Get trainer and class IDs for resources
    const [trainerIds, classIds] =
      branchIds.length > 0
        ? await Promise.all([
            this.trainersRepo
              .createQueryBuilder('trainer')
              .where('trainer.branchBranchId IN (:...branchIds)', { branchIds })
              .select('trainer.id')
              .getMany()
              .then((trainers) => trainers.map((trainer) => trainer.id)),
            this.classesRepo
              .createQueryBuilder('class')
              .where('class.branchBranchId IN (:...branchIds)', { branchIds })
              .select('class.class_id')
              .getMany()
              .then((classes) => classes.map((cls) => cls.class_id)),
          ])
        : [[], []];

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

    // Quick counts for today
    const [admissionCountToday, renewalCountToday, duePaidByMemberCountToday] =
      await Promise.all([
        branchIds.length > 0
          ? this.membersRepo
              .createQueryBuilder('member')
              .where('member.branchBranchId IN (:...branchIds)', { branchIds })
              .andWhere('member.createdAt >= :today', { today })
              .andWhere('member.createdAt < :tomorrow', { tomorrow })
              .getCount()
          : 0,
        branchIds.length > 0
          ? this.subscriptionsRepo
              .createQueryBuilder('subscription')
              .innerJoin('subscription.member', 'member')
              .where('subscription.startDate >= :today', { today })
              .andWhere('subscription.startDate < :tomorrow', { tomorrow })
              .andWhere('member.branchBranchId IN (:...branchIds)', {
                branchIds,
              })
              .andWhere('member.createdAt < :today', { today })
              .getCount()
          : 0,
        branchIds.length > 0
          ? this.paymentsRepo
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
          : 0,
      ]);

    // Recent Payments (limited)
    const recentPayments =
      branchIds.length > 0
        ? await this.paymentsRepo
            .createQueryBuilder('payment')
            .innerJoinAndSelect('payment.invoice', 'invoice')
            .innerJoinAndSelect('invoice.member', 'member')
            .where('member.branchBranchId IN (:...branchIds)', { branchIds })
            .orderBy('payment.created_at', 'DESC')
            .take(maxRecentPayments)
            .getMany()
        : [];

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
      },
    }));

    // Revenue Analytics with month-over-month comparison
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );

    // Active Members Analytics with month-over-month comparison (based on attendance)
    const [currentActiveMembers, lastMonthActiveMembers] =
      branchIds.length > 0
        ? await Promise.all([
            // Current active members (members who attended in current month)
            this.attendanceRepo
              .createQueryBuilder('attendance')
              .innerJoin('attendance.member', 'member')
              .where('member.branchBranchId IN (:...branchIds)', { branchIds })
              .andWhere('attendance.date >= :firstDayOfCurrentMonth', {
                firstDayOfCurrentMonth,
              })
              .andWhere('attendance.date < :firstDayOfNextMonth', {
                firstDayOfNextMonth,
              })
              .select('COUNT(DISTINCT member.id)', 'count')
              .getRawOne(),
            // Last month active members (members who attended in previous month)
            this.attendanceRepo
              .createQueryBuilder('attendance')
              .innerJoin('attendance.member', 'member')
              .where('member.branchBranchId IN (:...branchIds)', { branchIds })
              .andWhere('attendance.date >= :firstDayOfLastMonth', {
                firstDayOfLastMonth,
              })
              .andWhere('attendance.date < :firstDayOfCurrentMonth', {
                firstDayOfCurrentMonth,
              })
              .select('COUNT(DISTINCT member.id)', 'count')
              .getRawOne(),
          ])
        : [{ count: 0 }, { count: 0 }];

    const currentActiveCount = parseInt(currentActiveMembers?.count || '0');
    const lastMonthActiveCount = parseInt(lastMonthActiveMembers?.count || '0');

    // Calculate active members percentage change
    let activeChange = {
      percent: 0,
      type: 'nochange' as 'increase' | 'decrease' | 'nochange',
    };

    if (lastMonthActiveCount > 0) {
      const percentChange =
        ((currentActiveCount - lastMonthActiveCount) / lastMonthActiveCount) *
        100;
      activeChange = {
        percent: Math.round(percentChange * 100) / 100,
        type:
          percentChange > 0
            ? 'increase'
            : percentChange < 0
              ? 'decrease'
              : 'nochange',
      };
    } else if (currentActiveCount > 0) {
      activeChange = {
        percent: 100,
        type: 'increase',
      };
    }

    const [
      currentMonthRevenueResult,
      lastMonthRevenueResult,
      currentMonthRefundsResult,
      lastMonthRefundsResult,
    ] =
      branchIds.length > 0
        ? await Promise.all([
            // Completed payments (revenue)
            this.paymentsRepo
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
              .getRawOne(),
            // Last month completed payments
            this.paymentsRepo
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
              .getRawOne(),
            // Current month refunds (to deduct from revenue)
            this.paymentsRepo
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
              .andWhere('payment.status = :status', { status: 'refund' })
              .getRawOne(),
            // Last month refunds
            this.paymentsRepo
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
              .andWhere('payment.status = :status', { status: 'refund' })
              .getRawOne(),
          ])
        : [{ total: 0 }, { total: 0 }, { total: 0 }, { total: 0 }];

    const currentMonthRevenue =
      parseFloat(currentMonthRevenueResult?.total || '0') -
      parseFloat(currentMonthRefundsResult?.total || '0');
    const lastMonthRevenue =
      parseFloat(lastMonthRevenueResult?.total || '0') -
      parseFloat(lastMonthRefundsResult?.total || '0');

    // Calculate percentage change
    let revenueChange = {
      percent: 0,
      type: 'nochange' as 'increase' | 'decrease' | 'nochange',
    };

    if (lastMonthRevenue > 0) {
      const percentChange =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChange = {
        percent: Math.round(percentChange * 100) / 100, // Round to 2 decimal places
        type:
          percentChange > 0
            ? 'increase'
            : percentChange < 0
              ? 'decrease'
              : 'nochange',
      };
    } else if (currentMonthRevenue > 0) {
      revenueChange = {
        percent: 100,
        type: 'increase',
      };
    }

    return {
      gym: {
        id: gym.gymId,
        name: gym.name,
        branchId: mainBranch?.branchId,
        branchName: mainBranch?.name,
      },
      today: {
        payments: { online: onlinePayments, cash: cashPayments },
        attendance: attendanceToday,
        admissions: admissionCountToday,
        renewals: renewalCountToday,
        duesPaid: duePaidByMemberCountToday,
      },
      members: {
        total: totalMembers,
        active: {
          current_active: currentActiveCount,
          lastMonth_active: lastMonthActiveCount,
          change: activeChange,
        },
        expiring: {
          today: expiringToday,
          next10Days: expiring10Days,
          member_id: expiring10DaysMemberIds,
        },
        birthdays: {
          today: membersWithBirthdayToday,
          member_id: birthdayMemberIds,
        },
        dues: {
          count: amountDueMembers,
          totalAmount: totalAmountDueValue,
          members_id: duesMemberIds,
        },
      },
      resources: {
        trainers: {
          count: totalTrainers,
          trainers_id: trainerIds,
        },
        classes: {
          count: totalClasses,
          classes_id: classIds,
        },
      },
      revenue: {
        current: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: revenueChange,
      },
      memberGrowth: {
        current: currentActiveCount,
        lastMonth: lastMonthActiveCount,
        change: activeChange,
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

    const activeMembers = await this.countEffectiveActiveMembers({ branchIds });

    const expiringToday =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
            .getCount()
        : 0;

    const expiring3Days =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :threeDaysFromNow', {
              threeDaysFromNow,
            })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
            .andWhere('member.isActive = :memberIsActive', {
              memberIsActive: true,
            })
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
        expiringToday: expiringToday,
        expiring3days: expiring3Days,
        birthday_today: membersWithBirthdayToday,
        amount_due_members: amountDueMembers,
        total_amount_due: totalAmountDue,
      },
    };
  }

  /**
   * Get branch dashboard analytics
   */
  async getBranchDashboard(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    // Branch Analytics
    const [
      totalMembers,
      activeMembers,
      attendanceToday,
      totalTrainers,
      totalClasses,
      trainerIds,
      classIds,
    ] = await Promise.all([
      this.membersRepo.count({ where: { branch: { branchId } } }),
      this.countEffectiveActiveMembers({ branchId }),
      this.attendanceRepo.count({
        where: { date: Between(today, tomorrow), branch: { branchId } },
      }),
      this.trainersRepo.count({ where: { branch: { branchId } } }),
      this.classesRepo.count({ where: { branch: { branchId } } }),
      this.trainersRepo
        .createQueryBuilder('trainer')
        .where('trainer.branchBranchId = :branchId', { branchId })
        .select('trainer.id')
        .getMany()
        .then((trainers) => trainers.map((trainer) => trainer.id)),
      this.classesRepo
        .createQueryBuilder('class')
        .where('class.branchBranchId = :branchId', { branchId })
        .select('class.class_id')
        .getMany()
        .then((classes) => classes.map((cls) => cls.class_id)),
    ]);

    const [
      expiringToday,
      expiring10Days,
      amountDueMembers,
      totalAmountDue,
      duesMemberIds,
    ] = await Promise.all([
      this.subscriptionsRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.member', 'member')
        .where('subscription.endDate >= :today', { today })
        .andWhere('subscription.endDate < :tomorrow', { tomorrow })
        .andWhere('subscription.isActive = :isActive', { isActive: true })
        .andWhere('member.branchBranchId = :branchId', { branchId })
        .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
        .getCount(),
      this.subscriptionsRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.member', 'member')
        .where('subscription.endDate >= :today', { today })
        .andWhere('subscription.endDate < :tenDaysFromNow', {
          tenDaysFromNow,
        })
        .andWhere('subscription.isActive = :isActive', { isActive: true })
        .andWhere('member.branchBranchId = :branchId', { branchId })
        .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
        .getCount(),
      this.invoicesRepo
        .createQueryBuilder('invoice')
        .innerJoin('invoice.member', 'member')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('invoice.status = :status', { status: 'pending' })
        .getCount(),
      this.invoicesRepo
        .createQueryBuilder('invoice')
        .innerJoin('invoice.member', 'member')
        .select('SUM(invoice.total_amount)', 'total')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('invoice.status = :status', { status: 'pending' })
        .getRawOne(),
      this.invoicesRepo
        .createQueryBuilder('invoice')
        .innerJoin('invoice.member', 'member')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('invoice.status = :status', { status: 'pending' })
        .select('DISTINCT member.id', 'id')
        .getRawMany()
        .then((results) => results.map((result) => result.id)),
    ]);

    // Get member IDs for birthdays today
    const birthdayMemberIds = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', {
        month: today.getMonth() + 1,
      })
      .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', {
        day: today.getDate(),
      })
      .select('member.id')
      .getMany()
      .then((results) => results.map((result) => result.id));

    // Get member IDs for expiring today
    const expiringTodayMemberIds = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tomorrow', { tomorrow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
      .select('DISTINCT member.id', 'id')
      .getRawMany()
      .then((results) => results.map((result) => result.id));

    // Get member IDs for expiring in next 10 days
    const expiring10DaysMemberIds = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tenDaysFromNow', { tenDaysFromNow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .andWhere('member.branchBranchId = :branchId', { branchId })
      .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
      .select('DISTINCT member.id', 'id')
      .getRawMany()
      .then((results) => results.map((result) => result.id));

    const totalAmountDueValue = parseFloat(totalAmountDue?.total || '0');

    // Revenue Analytics with month-over-month comparison
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );

    // Active Members Analytics with month-over-month comparison (based on attendance)
    const [currentActiveMembers, lastMonthActiveMembers] = await Promise.all([
      // Current active members (members who attended in current month)
      this.attendanceRepo
        .createQueryBuilder('attendance')
        .innerJoin('attendance.member', 'member')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('attendance.date >= :firstDayOfCurrentMonth', {
          firstDayOfCurrentMonth,
        })
        .andWhere('attendance.date < :firstDayOfNextMonth', {
          firstDayOfNextMonth,
        })
        .select('COUNT(DISTINCT member.id)', 'count')
        .getRawOne(),
      // Last month active members (members who attended in previous month)
      this.attendanceRepo
        .createQueryBuilder('attendance')
        .innerJoin('attendance.member', 'member')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('attendance.date >= :firstDayOfLastMonth', {
          firstDayOfLastMonth,
        })
        .andWhere('attendance.date < :firstDayOfCurrentMonth', {
          firstDayOfCurrentMonth,
        })
        .select('COUNT(DISTINCT member.id)', 'count')
        .getRawOne(),
    ]);

    const currentActiveCount = parseInt(currentActiveMembers?.count || '0');
    const lastMonthActiveCount = parseInt(lastMonthActiveMembers?.count || '0');

    // Calculate active members percentage change
    let activeChange = {
      percent: 0,
      type: 'nochange' as 'increase' | 'decrease' | 'nochange',
    };

    if (lastMonthActiveCount > 0) {
      const percentChange =
        ((currentActiveCount - lastMonthActiveCount) / lastMonthActiveCount) *
        100;
      activeChange = {
        percent: Math.round(percentChange * 100) / 100,
        type:
          percentChange > 0
            ? 'increase'
            : percentChange < 0
              ? 'decrease'
              : 'nochange',
      };
    } else if (currentActiveCount > 0) {
      activeChange = {
        percent: 100,
        type: 'increase',
      };
    }

    const [
      currentMonthRevenueResult,
      lastMonthRevenueResult,
      currentMonthRefundsResult,
      lastMonthRefundsResult,
    ] = await Promise.all([
      // Completed payments (revenue)
      this.paymentsRepo
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
        .getRawOne(),
      // Last month completed payments
      this.paymentsRepo
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
        .getRawOne(),
      // Current month refunds (to deduct from revenue)
      this.paymentsRepo
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
        .andWhere('payment.status = :status', { status: 'refund' })
        .getRawOne(),
      // Last month refunds
      this.paymentsRepo
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
        .andWhere('payment.status = :status', { status: 'refund' })
        .getRawOne(),
    ]);

    const currentMonthRevenue =
      parseFloat(currentMonthRevenueResult?.total || '0') -
      parseFloat(currentMonthRefundsResult?.total || '0');
    const lastMonthRevenue =
      parseFloat(lastMonthRevenueResult?.total || '0') -
      parseFloat(lastMonthRefundsResult?.total || '0');

    // Calculate percentage change
    let revenueChange = {
      percent: 0,
      type: 'nochange' as 'increase' | 'decrease' | 'nochange',
    };

    if (lastMonthRevenue > 0) {
      const percentChange =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChange = {
        percent: Math.round(percentChange * 100) / 100,
        type:
          percentChange > 0
            ? 'increase'
            : percentChange < 0
              ? 'decrease'
              : 'nochange',
      };
    } else if (currentMonthRevenue > 0) {
      revenueChange = {
        percent: 100,
        type: 'increase',
      };
    }

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

    // Recent Payments
    const recentPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .innerJoinAndSelect('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .orderBy('payment.created_at', 'DESC')
      .take(5)
      .getMany();

    const formattedPayments = recentPayments.map((payment) => ({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.created_at,
      member: {
        id: payment.invoice.member.id,
        fullName: payment.invoice.member.fullName,
      },
      invoice: {
        invoiceId: payment.invoice.invoice_id,
        totalAmount: payment.invoice.total_amount,
      },
    }));

    return {
      gym: {
        id: branch.gym.gymId,
        name: branch.gym.name,
        branchId: branch.branchId,
        branchName: branch.name,
      },
      today: {
        payments: { online: onlinePayments, cash: cashPayments },
        attendance: attendanceToday,
        admissions: 0,
        renewals: 0,
        duesPaid: 0,
      },
      members: {
        total: totalMembers,
        active: {
          current_active: currentActiveCount,
          lastMonth_active: lastMonthActiveCount,
          change: activeChange,
        },
        inactive: totalMembers - activeMembers,
        expiring: {
          today: expiringToday,
          next10Days: expiring10Days,
          member_id: expiring10DaysMemberIds,
        },
        birthdays: {
          today: birthdayMemberIds.length,
          member_id: birthdayMemberIds,
        },
        dues: {
          count: amountDueMembers,
          totalAmount: totalAmountDueValue,
          members_id: duesMemberIds,
        },
      },
      resources: {
        trainers: { count: totalTrainers, trainers_id: trainerIds },
        classes: { count: totalClasses, classes_id: classIds },
      },
      revenue: {
        current: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: revenueChange,
      },
      memberGrowth: {
        current: currentActiveCount,
        lastMonth: lastMonthActiveCount,
        change: activeChange,
      },
      recentPayments: formattedPayments,
    };
  }

  /**
   * Get branch member analytics
   */
  async getBranchMemberAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const [
      totalMembers,
      activeMembers,
      expiringToday,
      expiring3Days,
      amountDueMembers,
    ] = await Promise.all([
      this.membersRepo.count({ where: { branch: { branchId } } }),
      this.countEffectiveActiveMembers({ branchId }),
      this.subscriptionsRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.member', 'member')
        .where('subscription.endDate >= :today', { today })
        .andWhere('subscription.endDate < :tomorrow', { tomorrow })
        .andWhere('subscription.isActive = :isActive', { isActive: true })
        .andWhere('member.branchBranchId = :branchId', { branchId })
        .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
        .getCount(),
      this.subscriptionsRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.member', 'member')
        .where('subscription.endDate >= :today', { today })
        .andWhere('subscription.endDate < :threeDaysFromNow', {
          threeDaysFromNow,
        })
        .andWhere('subscription.isActive = :isActive', { isActive: true })
        .andWhere('member.branchBranchId = :branchId', { branchId })
        .andWhere('member.isActive = :memberIsActive', { memberIsActive: true })
        .getCount(),
      this.invoicesRepo
        .createQueryBuilder('invoice')
        .innerJoin('invoice.member', 'member')
        .where('member.branchBranchId = :branchId', { branchId })
        .andWhere('invoice.status = :status', { status: 'pending' })
        .getCount(),
    ]);

    return {
      gymId: branch.gym.gymId,
      gymName: branch.gym.name,
      branchId: branch.branchId,
      branchName: branch.name,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiringToday,
        expiring3days: expiring3Days,
        birthday_today: 0,
        amount_due_members: amountDueMembers,
      },
    };
  }

  /**
   * Get gym attendance analytics
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
      attendance: { today: attendanceToday },
    };
  }

  /**
   * Get branch attendance analytics
   */
  async getBranchAttendanceAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceToday = await this.attendanceRepo.count({
      where: { date: Between(today, tomorrow), branch: { branchId } },
    });

    return {
      gymId: branch.gym.gymId,
      gymName: branch.gym.name,
      branchId: branch.branchId,
      branchName: branch.name,
      attendance: { today: attendanceToday },
    };
  }

  /**
   * Get gym recent payments
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

    return {
      gymId: gym.gymId,
      gymName: gym.name,
      branchId: mainBranch?.branchId,
      branchName: mainBranch?.name,
      recentPayments,
    };
  }

  /**
   * Get branch recent payments
   */
  async getBranchRecentPayments(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
      relations: ['gym'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const recentPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .innerJoinAndSelect('invoice.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .orderBy('payment.created_at', 'DESC')
      .take(10)
      .getMany();

    return {
      gymId: branch.gym.gymId,
      gymName: branch.gym.name,
      branchId: branch.branchId,
      branchName: branch.name,
      recentPayments,
    };
  }

  /**
   * Get trainer dashboard analytics
   */
  async getTrainerDashboard(trainerId: string) {
    const trainer = await this.trainersRepo.findOne({
      where: { id: parseInt(trainerId) },
      relations: ['branch'],
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const classesData = await this.classesRepo
      .createQueryBuilder('class')
      .where('class.branchBranchId = :branchId', {
        branchId: trainer.branch.branchId,
      })
      .select(['class.class_id', 'class.name', 'class.timings'])
      .getMany();

    const assignedMembers = await this.assignmentsRepo
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.member', 'member')
      .innerJoin('assignment.trainer', 'trainer')
      .where('trainer.id = :trainerId', { trainerId: trainer.id })
      .getMany();

    return {
      trainer: {
        id: trainer.id,
        fullName: trainer.fullName,
        specialization: trainer.specialization,
      },
      classes: classesData,
      stats: {
        totalClasses: classesData.length,
        totalMembers: assignedMembers.length,
      },
      assignedMembers: assignedMembers.map((assignment) => ({
        id: assignment.member.id,
        fullName: assignment.member.fullName,
      })),
    };
  }

  /**
   * Get comprehensive monthly report
   */
  async getMonthlyReport(
    year: number,
    month: number,
    gymId?: string,
    branchId?: string,
  ) {
    if (year < 2000 || year > 2100) {
      throw new Error('Year must be between 2000 and 2100');
    }
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const prevMonthStart = new Date(year, month - 2, 1);
    prevMonthStart.setHours(0, 0, 0, 0);

    const prevMonthEnd = new Date(year, month - 1, 0);
    prevMonthEnd.setHours(23, 59, 59, 999);

    let memberFilter = 'member.isActive = :memberActive';
    const memberParams: any = { memberActive: true };

    if (branchId) {
      memberFilter += ' AND member.branchBranchId = :branchId';
      memberParams.branchId = branchId;
    } else if (gymId) {
      const gym = await this.gymsRepo.findOne({ where: { gymId } });
      if (!gym) {
        throw new NotFoundException(`Gym with ID ${gymId} not found`);
      }

      const branches = await this.branchesRepo
        .createQueryBuilder('branch')
        .where('branch.gym.gymId = :gymId', { gymId })
        .getMany();

      if (branches.length > 0) {
        const branchIds = branches.map((b) => b.branchId);
        memberFilter += ' AND member.branchBranchId IN (:...branchIds)';
        memberParams.branchIds = branchIds;
      }
    }

    const completedPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .where('payment.status = :status', { status: 'completed' })
      .andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .getMany();

    const totalRevenue = completedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const revenueByMethod = {
      cash: { count: 0, amount: 0, percentage: 0 },
      card: { count: 0, amount: 0, percentage: 0 },
      online: { count: 0, amount: 0, percentage: 0 },
      bank_transfer: { count: 0, amount: 0, percentage: 0 },
    };

    completedPayments.forEach((payment) => {
      const method = payment.method;
      if (revenueByMethod[method]) {
        revenueByMethod[method].count++;
        revenueByMethod[method].amount += Number(payment.amount);
      }
    });

    Object.keys(revenueByMethod).forEach((key) => {
      if (totalRevenue > 0) {
        revenueByMethod[key].percentage =
          (revenueByMethod[key].amount / totalRevenue) * 100;
      }
    });

    const activeAtStart = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where(
        'subscription.endDate >= :prevMonthStart AND subscription.endDate <= :prevMonthEnd',
        { prevMonthStart, prevMonthEnd },
      )
      .andWhere(memberFilter, memberParams)
      .andWhere('subscription.isActive = :subscriptionActive', {
        subscriptionActive: true,
      })
      .getCount();

    const activeAtEnd = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate >= :endDate', { endDate })
      .andWhere(memberFilter, memberParams)
      .andWhere('subscription.isActive = :subscriptionActive', {
        subscriptionActive: true,
      })
      .getCount();

    const newMembers = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .getCount();

    const attendanceRecords = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .innerJoin('attendance.branch', 'branch')
      .where('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const totalCheckIns = attendanceRecords.length;
    const daysInMonth = new Date(year, month, 0).getDate();
    const averageDaily = totalCheckIns / daysInMonth;

    const attendanceByDate = new Map<string, number>();
    attendanceRecords.forEach((att) => {
      const dateStr = att.date.toISOString().split('T')[0];
      attendanceByDate.set(dateStr, (attendanceByDate.get(dateStr) || 0) + 1);
    });

    let peakDay = '';
    let peakDayCount = 0;
    attendanceByDate.forEach((count, date) => {
      if (count > peakDayCount) {
        peakDay = date;
        peakDayCount = count;
      }
    });

    const invoicesInMonth = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .where('invoice.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .getMany();

    const invoices = {
      total: invoicesInMonth.length,
      paid: invoicesInMonth.filter((inv) => inv.status === 'paid').length,
      pending: invoicesInMonth.filter((inv) => inv.status === 'pending').length,
      overdue: invoicesInMonth.filter(
        (inv) =>
          inv.status === 'pending' &&
          inv.due_date &&
          new Date(inv.due_date) < new Date(),
      ).length,
      collectionRate: 0,
    };

    if (invoices.total > 0) {
      invoices.collectionRate = (invoices.paid / invoices.total) * 100;
    }

    const expiringThisMonth = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .andWhere('subscription.isActive = :subscriptionActive', {
        subscriptionActive: true,
      })
      .getCount();

    const expiredThisMonth = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('subscription.endDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .andWhere('subscription.isActive = :subscriptionActive', {
        subscriptionActive: false,
      })
      .getCount();

    const renewals = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .innerJoin('invoice.subscription', 'currentSub')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere(memberFilter, memberParams)
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(MemberSubscription, 'prevSub')
          .where('prevSub.member = member.id')
          .andWhere('prevSub.endDate < currentSub.startDate')
          .getQuery();
        return `EXISTS ${subQuery}`;
      })
      .getCount();

    const topPlansRaw = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .innerJoin('invoice.subscription', 'subscription')
      .innerJoin('subscription.plan', 'plan')
      .where('payment.status = :status', { status: 'completed' })
      .andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(memberFilter, memberParams)
      .select('plan.name', 'planName')
      .addSelect('COUNT(payment.transaction_id)', 'count')
      .addSelect('SUM(payment.amount)', 'revenue')
      .groupBy('plan.name')
      .orderBy('SUM(payment.amount)', 'DESC')
      .limit(5)
      .getRawMany();

    const topPlans = topPlansRaw.map((row) => ({
      planName: row.planName,
      count: parseInt(row.count, 10),
      revenue: parseFloat(row.revenue),
    }));

    const membershipGrowth = activeAtEnd - activeAtStart;
    const growthPercentage =
      activeAtStart > 0 ? (membershipGrowth / activeAtStart) * 100 : 0;

    const summary = {
      totalRevenue,
      totalTransactions: completedPayments.length,
      newMembers,
      renewals,
      averageRevenuePerMember: activeAtEnd > 0 ? totalRevenue / activeAtEnd : 0,
    };

    return {
      period: {
        year,
        month,
        monthName: monthNames[month - 1],
      },
      summary,
      revenueByMethod,
      membership: {
        activeAtEnd,
        activeAtStart,
        growth: membershipGrowth,
        growthPercentage,
        expiringThisMonth,
        expiredThisMonth,
        renewedThisMonth: renewals,
      },
      attendance: {
        totalCheckIns,
        averageDaily,
        peakDay,
        peakDayCount,
      },
      invoices,
      topPlans,
    };
  }
}
