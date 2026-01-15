import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
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
      this.membersRepo.count({
        where: { isActive: true, branch: { branchId: In(branchIds) } },
      }),
      branchIds.length > 0
        ? this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
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
            .select('DISTINCT subscription.memberId', 'id')
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
            .select('DISTINCT subscription.memberId', 'id')
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

    const [currentMonthRevenueResult, lastMonthRevenueResult] =
      branchIds.length > 0
        ? await Promise.all([
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
          ])
        : [{ total: 0 }, { total: 0 }];

    const currentMonthRevenue = parseFloat(
      currentMonthRevenueResult?.total || '0',
    );
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.total || '0');

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

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId: In(branchIds) } },
    });

    const expiringToday =
      branchIds.length > 0
        ? await this.subscriptionsRepo
            .createQueryBuilder('subscription')
            .where('subscription.endDate >= :today', { today })
            .andWhere('subscription.endDate < :tomorrow', { tomorrow })
            .andWhere('subscription.isActive = :isActive', { isActive: true })
            .innerJoin('subscription.member', 'member')
            .andWhere('member.branchBranchId IN (:...branchIds)', { branchIds })
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
      this.membersRepo.count({
        where: { isActive: true, branch: { branchId } },
      }),
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

    const [currentMonthRevenueResult, lastMonthRevenueResult] =
      await Promise.all([
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
      ]);

    const currentMonthRevenue = parseFloat(
      currentMonthRevenueResult?.total || '0',
    );
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.total || '0');

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
      this.membersRepo.count({
        where: { isActive: true, branch: { branchId } },
      }),
      this.subscriptionsRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.member', 'member')
        .where('subscription.endDate >= :today', { today })
        .andWhere('subscription.endDate < :tomorrow', { tomorrow })
        .andWhere('subscription.isActive = :isActive', { isActive: true })
        .andWhere('member.branchBranchId = :branchId', { branchId })
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
      .where('assignment.trainerId = :trainerId', { trainerId: trainer.id })
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
}
