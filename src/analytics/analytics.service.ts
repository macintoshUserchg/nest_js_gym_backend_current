import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm';
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

    const branchIds = gym.branches.map(b => b.branchId);
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

    const expiringToday = await this.subscriptionsRepo.count({
      where: {
        endDate: Between(today, tomorrow),
        isActive: true,
      },
    });

    const expiring3Days = await this.subscriptionsRepo.count({
      where: {
        endDate: Between(today, threeDaysFromNow),
        isActive: true,
      },
    });

    // Members with birthdays today
    const membersWithBirthdayToday = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('EXTRACT(MONTH FROM member.dateOfBirth) = :month', { month: today.getMonth() + 1 })
      .andWhere('EXTRACT(DAY FROM member.dateOfBirth) = :day', { day: today.getDate() })
      .getCount();

    // Amount due members (invoices with status 'pending')
    const amountDueMembers = await this.invoicesRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('invoice.status = :status', { status: 'pending' })
      .getCount();

    // Attendance Today
    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId: In(branchIds) },
      },
    });

    // Trainer Count
    const totalTrainers = await this.trainersRepo.count({
      where: { branch: { branchId: In(branchIds) } },
    });

    // Class Count
    const totalClasses = await this.classesRepo.count({
      where: { branch: { branchId: In(branchIds) } },
    });

    // Payment Analytics for Today
    const paymentsToday = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('payment.created_at >= :today', { today })
      .andWhere('payment.created_at < :tomorrow', { tomorrow })
      .andWhere('payment.status = :status', { status: 'completed' })
      .getMany();

    const cashPayments = paymentsToday.filter(p => p.method === 'cash').length;
    const onlinePayments = paymentsToday.filter(p => p.method !== 'cash').length;

    // Admission count today (new members created today)
    const admissionCountToday = await this.membersRepo
      .createQueryBuilder('member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('member.createdAt >= :today', { today })
      .andWhere('member.createdAt < :tomorrow', { tomorrow })
      .getCount();

    // Renewal count today (subscriptions created today for existing members)
    const renewalCountToday = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('subscription.startDate >= :today', { today })
      .andWhere('subscription.startDate < :tomorrow', { tomorrow })
      .andWhere('member.createdAt < :today', { today })
      .getCount();

    // Due paid by member count today (invoices paid today that were previously pending)
    const duePaidByMemberCountToday = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .innerJoin('invoice.member', 'member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .andWhere('payment.created_at >= :today', { today })
      .andWhere('payment.created_at < :tomorrow', { tomorrow })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('invoice.status = :invoiceStatus', { invoiceStatus: 'paid' })
      .getCount();

    return {
      gymId,
      gymName: gym.name,
      totalBranches: gym.branches.length,
      payments_today: {
        online: onlinePayments,
        cash: cashPayments,
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiringToday,
        amount_due_members: amountDueMembers,
        expiring3days: expiring3Days,
        birthday_today: membersWithBirthdayToday,
      },
      attendance: {
        today: attendanceToday,
      },
      trainers: {
        total: totalTrainers,
      },
      classes: {
        total: totalClasses,
      },
      admission_count_today: admissionCountToday,
      renewal_count_today: renewalCountToday,
      due_paid_by_member_count_today: duePaidByMemberCountToday,
    };
  }

  async getBranchDashboard(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

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
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate < :tomorrow', { tomorrow })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .getCount();

    const expiringThisWeek = await this.subscriptionsRepo
      .createQueryBuilder('subscription')
      .innerJoin('subscription.member', 'member')
      .where('member.branchBranchId = :branchId', { branchId })
      .andWhere('subscription.endDate >= :today', { today })
      .andWhere('subscription.endDate <= :weekEnd', { weekEnd: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) })
      .andWhere('subscription.isActive = :isActive', { isActive: true })
      .getCount();

    // Attendance Analytics
    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
      },
    });

    const attendanceThisWeek = await this.attendanceRepo.count({
      where: {
        date: MoreThanOrEqual(weekAgo),
        branch: { branchId },
      },
    });

    const memberAttendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
        attendanceType: 'member',
      },
    });

    const trainerAttendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
        attendanceType: 'trainer',
      },
    });

    // Trainer Analytics
    const totalTrainers = await this.trainersRepo.count({
      where: { branch: { branchId } },
    });

    // Class Analytics
    const totalClasses = await this.classesRepo.count({
      where: { branch: { branchId } },
    });

    // Active Assignments
    const activeAssignments = await this.assignmentsRepo.count({
      where: { status: 'active' },
    });

    return {
      branchId,
      branchName: branch.name,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        expiringToday,
        expiringThisWeek,
      },
      attendance: {
        today: attendanceToday,
        thisWeek: attendanceThisWeek,
        memberToday: memberAttendanceToday,
        trainerToday: trainerAttendanceToday,
      },
      trainers: {
        total: totalTrainers,
        activeAssignments,
      },
      classes: {
        total: totalClasses,
      },
    };
  }

  async getGymMemberAnalytics(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map(b => b.branchId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId: In(branchIds) } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId: In(branchIds) } },
    });

    const activeSubscriptions = await this.subscriptionsRepo.count({
      where: { isActive: true },
    });

    return {
      gymId,
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      activeSubscriptions,
      inactiveSubscriptions: totalMembers - activeSubscriptions,
    };
  }

  async getBranchMemberAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const totalMembers = await this.membersRepo.count({
      where: { branch: { branchId } },
    });

    const activeMembers = await this.membersRepo.count({
      where: { isActive: true, branch: { branchId } },
    });

    const members = await this.membersRepo.find({
      where: { branch: { branchId } },
      relations: ['subscription'],
      take: 10,
      order: { id: 'DESC' },
    });

    const recentMembers = members.map(m => ({
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      isActive: m.isActive,
      hasActiveSubscription: m.subscription?.isActive || false,
    }));

    return {
      branchId,
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      recentMembers,
    };
  }

  async getGymAttendanceAnalytics(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map(b => b.branchId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId: In(branchIds) },
      },
    });

    const attendanceThisWeek = await this.attendanceRepo.count({
      where: {
        date: MoreThanOrEqual(weekAgo),
        branch: { branchId: In(branchIds) },
      },
    });

    const attendanceThisMonth = await this.attendanceRepo.count({
      where: {
        date: MoreThanOrEqual(monthAgo),
        branch: { branchId: In(branchIds) },
      },
    });

    return {
      gymId,
      today: attendanceToday,
      thisWeek: attendanceThisWeek,
      thisMonth: attendanceThisMonth,
    };
  }

  async getBranchAttendanceAnalytics(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const attendanceToday = await this.attendanceRepo.count({
      where: {
        date: Between(today, tomorrow),
        branch: { branchId },
      },
    });

    const attendanceThisWeek = await this.attendanceRepo.count({
      where: {
        date: MoreThanOrEqual(weekAgo),
        branch: { branchId },
      },
    });

    const attendanceThisMonth = await this.attendanceRepo.count({
      where: {
        date: MoreThanOrEqual(monthAgo),
        branch: { branchId },
      },
    });

    const recentAttendance = await this.attendanceRepo.find({
      where: { branch: { branchId } },
      relations: ['member', 'trainer'],
      take: 10,
      order: { checkInTime: 'DESC' },
    });

    return {
      branchId,
      today: attendanceToday,
      thisWeek: attendanceThisWeek,
      thisMonth: attendanceThisMonth,
      recent: recentAttendance.map(a => ({
        id: a.id,
        type: a.attendanceType,
        name: a.member?.fullName || a.trainer?.fullName,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
      })),
    };
  }

  async getGymRecentPayments(gymId: string) {
    const gym = await this.gymsRepo.findOne({
      where: { gymId },
      relations: ['branches'],
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${gymId} not found`);
    }

    const branchIds = gym.branches.map(b => b.branchId);

    const recentPayments = await this.paymentsRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .innerJoinAndSelect('invoice.member', 'member')
      .where('member.branchBranchId IN (:...branchIds)', { branchIds })
      .orderBy('payment.created_at', 'DESC')
      .take(10)
      .getMany();

    return {
      gymId,
      gymName: gym.name,
      recentPayments: recentPayments.map(payment => ({
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
      })),
    };
  }

  async getBranchRecentPayments(branchId: string) {
    const branch = await this.branchesRepo.findOne({
      where: { branchId },
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
      branchId,
      branchName: branch.name,
      recentPayments: recentPayments.map(payment => ({
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
      })),
    };
  }
}
