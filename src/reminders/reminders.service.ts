import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { NotificationType } from '../entities/notifications.entity';
import {
  ReminderChannel,
  ReminderLog,
  ReminderType,
} from '../entities/reminder_logs.entity';
import { Member } from '../entities/members.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { Invoice } from '../entities/invoices.entity';
import { RenewalRequest, RenewalStatus } from '../entities/renewal_requests.entity';
import { User } from '../entities/users.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(ReminderLog)
    private reminderLogsRepo: Repository<ReminderLog>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
    @InjectRepository(RenewalRequest)
    private renewalRequestsRepo: Repository<RenewalRequest>,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async runDailyReminders() {
    await this.sendExpiryReminders();
    await this.sendDueReminders();
    await this.sendRenewalFollowUps();
  }

  async sendManualDueReminder(memberId: number) {
    const invoice = await this.invoicesRepo.findOne({
      where: { member: { id: memberId }, status: 'pending' },
      relations: ['member'],
      order: { created_at: 'DESC' },
    });

    if (!invoice) {
      throw new NotFoundException('No pending invoice found for this member');
    }

    await this.sendDueReminderForInvoice(invoice, invoice.due_date || new Date());
    return this.getLatestReminderSummary(memberId);
  }

  async sendManualExpiryReminder(memberId: number) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { member: { id: memberId } },
      relations: ['member', 'plan'],
      order: { endDate: 'DESC' },
    });

    if (!subscription || !subscription.member) {
      throw new NotFoundException('No subscription found for this member');
    }

    const daysUntilExpiry = this.daysBetween(new Date(), subscription.endDate);
    const title =
      daysUntilExpiry < 0
        ? 'Membership has expired'
        : daysUntilExpiry === 0
          ? 'Membership expires today'
          : `Membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`;
    const message =
      daysUntilExpiry < 0
        ? `Your membership expired on ${subscription.endDate.toDateString()}. Contact the gym front desk to renew it.`
        : daysUntilExpiry === 0
          ? 'Your membership expires today. Renew soon to avoid interruption.'
          : `Your membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.`;

    await this.sendReminder({
      userId: await this.resolveUserId(memberId),
      memberId,
      reminderType: ReminderType.SUBSCRIPTION_EXPIRY,
      referenceDate: subscription.endDate,
      email: subscription.member.email,
      title,
      message,
    });

    return this.getLatestReminderSummary(memberId);
  }

  async getLatestReminderSummary(memberId: number) {
    const logs = await this.reminderLogsRepo.find({
      where: { memberId },
      order: { sentAt: 'DESC' },
      take: 10,
    });

    const latestByType = logs.reduce<Record<string, ReminderLog>>((acc, log) => {
      if (!acc[log.reminderType]) {
        acc[log.reminderType] = log;
      }
      return acc;
    }, {});

    return latestByType;
  }

  async sendRenewalInvoiceCreatedReminder(request: RenewalRequest) {
    if (!request.invoice) {
      return;
    }

    const subject = 'Renewal invoice created';
    const message = `Your renewal request for ${request.requestedPlan.name} is ready. Invoice ${request.invoice.invoice_id} is awaiting payment confirmation.`;
    const userId = await this.resolveUserId(request.member.id);
    if (!userId) {
      return;
    }

    await this.sendReminder({
      userId,
      memberId: request.member.id,
      invoiceId: request.invoice.invoice_id,
      renewalRequestId: request.id,
      reminderType: ReminderType.RENEWAL_INVOICE,
      referenceDate: new Date(),
      email: request.member.email,
      title: subject,
      message,
    });
  }

  async sendRenewalActivatedReminder(request: RenewalRequest) {
    const subject = 'Membership renewal activated';
    const message = `Your renewal for ${request.requestedPlan.name} has been activated successfully.`;
    await this.sendReminder({
      userId: await this.resolveUserId(request.member.id),
      memberId: request.member.id,
      invoiceId: request.invoice?.invoice_id,
      renewalRequestId: request.id,
      reminderType: ReminderType.RENEWAL_ACTIVATED,
      referenceDate: new Date(),
      email: request.member.email,
      title: subject,
      message,
    });
  }

  private async sendExpiryReminders() {
    const subscriptions = await this.subscriptionsRepo.find({
      where: { isActive: true },
      relations: ['member', 'plan'],
    });

    const targets = new Set([7, 3, 1, 0]);

    for (const subscription of subscriptions) {
      const member = subscription.member;
      if (!member) continue;

      const daysUntilExpiry = this.daysBetween(new Date(), subscription.endDate);
      if (!targets.has(daysUntilExpiry)) {
        continue;
      }

      await this.sendReminder({
        userId: await this.resolveUserId(member.id),
        memberId: member.id,
        reminderType: ReminderType.SUBSCRIPTION_EXPIRY,
        referenceDate: subscription.endDate,
        email: member.email,
        title:
          daysUntilExpiry === 0
            ? 'Membership expires today'
            : `Membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
        message:
          daysUntilExpiry === 0
            ? `Your membership expires today. Renew soon to avoid interruption.`
            : `Your membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.`,
      });
    }
  }

  private async sendDueReminders() {
    const invoices = await this.invoicesRepo.find({
      where: { status: 'pending' },
      relations: ['member'],
    });

    for (const invoice of invoices) {
      if (!invoice.due_date || !invoice.member) {
        continue;
      }

      const daysOverdue = this.daysBetween(invoice.due_date, new Date());
      if (![1, 3, 7].includes(daysOverdue)) {
        continue;
      }

      await this.sendDueReminderForInvoice(invoice, invoice.due_date);
    }
  }

  private async sendRenewalFollowUps() {
    const requests = await this.renewalRequestsRepo.find({
      where: { status: RenewalStatus.INVOICED },
      relations: ['invoice', 'member', 'requestedPlan'],
    });

    for (const request of requests) {
      if (!request.invoice || request.invoice.status !== 'pending') {
        continue;
      }

      const daysSinceCreated = this.daysBetween(request.createdAt, new Date());
      if (![2, 4, 6].includes(daysSinceCreated)) {
        continue;
      }

      await this.sendReminder({
        userId: await this.resolveUserId(request.member.id),
        memberId: request.member.id,
        invoiceId: request.invoice.invoice_id,
        renewalRequestId: request.id,
        reminderType: ReminderType.RENEWAL_INVOICE,
        referenceDate: new Date(
          request.createdAt.getTime() + daysSinceCreated * 24 * 60 * 60 * 1000,
        ),
        email: request.member.email,
        title: 'Renewal payment reminder',
        message: `Your renewal for ${request.requestedPlan.name} is awaiting payment confirmation.`,
      });
    }
  }

  private async sendDueReminderForInvoice(invoice: Invoice, referenceDate: Date) {
    await this.sendReminder({
      userId: await this.resolveUserId(invoice.member.id),
      memberId: invoice.member.id,
      invoiceId: invoice.invoice_id,
      reminderType: ReminderType.DUE_PAYMENT,
      referenceDate,
      email: invoice.member.email,
      title: 'Pending membership dues',
      message: `Invoice ${invoice.invoice_id} is still pending. Please contact the gym front desk to complete payment.`,
    });
  }

  private async sendReminder(args: {
    userId: string;
    memberId: number;
    invoiceId?: string;
    renewalRequestId?: string;
    reminderType: ReminderType;
    referenceDate: Date;
    email?: string;
    title: string;
    message: string;
  }) {
    if (!args.userId) {
      return;
    }

    const referenceDate = this.toDateOnly(args.referenceDate);
    const emailAlreadySent = await this.hasReminderBeenSent(
      args.userId,
      args.reminderType,
      ReminderChannel.EMAIL,
      referenceDate,
    );
    const inAppAlreadySent = await this.hasReminderBeenSent(
      args.userId,
      args.reminderType,
      ReminderChannel.IN_APP,
      referenceDate,
    );

    if (!emailAlreadySent && args.email) {
      await this.sendEmail(args.email, args.title, args.message);
      await this.logReminder({
        ...args,
        channel: ReminderChannel.EMAIL,
        referenceDate,
      });
    }

    if (!inAppAlreadySent) {
      await this.notificationsService.create({
        userId: args.userId,
        title: args.title,
        message: args.message,
        type: NotificationType.REMINDER,
        metadata: {
          entity_type: 'reminder',
          action: args.reminderType,
          related_data: {
            invoiceId: args.invoiceId,
            renewalRequestId: args.renewalRequestId,
          },
        },
      });
      await this.logReminder({
        ...args,
        channel: ReminderChannel.IN_APP,
        referenceDate,
      });
    }
  }

  private async logReminder(args: {
    userId: string;
    memberId: number;
    invoiceId?: string;
    renewalRequestId?: string;
    reminderType: ReminderType;
    channel: ReminderChannel;
    referenceDate: Date;
    title: string;
    message: string;
  }) {
    const log = this.reminderLogsRepo.create({
      userId: args.userId,
      memberId: args.memberId,
      invoiceId: args.invoiceId,
      renewalRequestId: args.renewalRequestId,
      reminderType: args.reminderType,
      channel: args.channel,
      referenceDate: this.toDateOnly(args.referenceDate),
      metadata: {
        title: args.title,
        message: args.message,
      },
    });
    await this.reminderLogsRepo.save(log);
  }

  private async resolveUserId(memberId: number) {
    const member = await this.membersRepo.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    const user = await this.usersRepo.findOne({
      where: { memberId: member.id.toString() },
    });

    return user?.userId || '';
  }

  private async sendEmail(to: string, subject: string, text: string) {
    const transport = this.createTransport();
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });
  }

  private createTransport() {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      throw new ServiceUnavailableException(
        'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
      );
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async hasReminderBeenSent(
    userId: string,
    reminderType: ReminderType,
    channel: ReminderChannel,
    referenceDate: Date,
  ) {
    const count = await this.reminderLogsRepo.count({
      where: {
        userId,
        reminderType,
        channel,
        referenceDate: this.toDateOnly(referenceDate),
      },
    });
    return count > 0;
  }

  private daysBetween(start: Date, end: Date) {
    const startDate = this.toDateOnly(start).getTime();
    const endDate = this.toDateOnly(end).getTime();
    return Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
  }

  private toDateOnly(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
