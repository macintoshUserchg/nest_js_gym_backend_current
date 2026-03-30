import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  RenewalRequest,
  RenewalStatus,
} from '../entities/renewal_requests.entity';
import { Member } from '../entities/members.entity';
import { MembershipPlan } from '../entities/membership_plans.entity';
import { Invoice } from '../entities/invoices.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { CreateRenewalRequestDto } from './dto/create-renewal-request.dto';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class RenewalsService {
  constructor(
    @InjectRepository(RenewalRequest)
    private renewalRequestsRepo: Repository<RenewalRequest>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(MembershipPlan)
    private membershipPlansRepo: Repository<MembershipPlan>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
    private remindersService: RemindersService,
  ) {}

  async createForMember(memberId: number, dto: CreateRenewalRequestDto) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
      relations: ['subscription', 'subscription.plan'],
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const plan = await this.membershipPlansRepo.findOne({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException(
        `Membership plan with ID ${dto.planId} not found`,
      );
    }

    const existingOpenRequest = await this.renewalRequestsRepo.findOne({
      where: {
        member: { id: memberId },
        status: In([
          RenewalStatus.REQUESTED,
          RenewalStatus.INVOICED,
          RenewalStatus.PAID,
        ]),
      },
    });
    if (existingOpenRequest) {
      throw new BadRequestException(
        'An active renewal request already exists for this member',
      );
    }

    const now = new Date();
    const requestedStartDate =
      member.subscription?.isActive &&
      member.subscription.endDate &&
      member.subscription.endDate >= now
        ? new Date(member.subscription.endDate.getTime() + 24 * 60 * 60 * 1000)
        : now;

    const invoice = this.invoicesRepo.create({
      member,
      subscription: member.subscription,
      total_amount: plan.price,
      description: `Renewal request for ${plan.name}`,
      due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });
    const savedInvoice = await this.invoicesRepo.save(invoice);

    const renewalRequest = this.renewalRequestsRepo.create({
      member,
      requestedPlan: plan,
      currentSubscription: member.subscription,
      invoice: savedInvoice,
      requestedStartDate,
      status: RenewalStatus.INVOICED,
    });
    const savedRequest = await this.renewalRequestsRepo.save(renewalRequest);

    await this.remindersService.sendRenewalInvoiceCreatedReminder(savedRequest);
    return savedRequest;
  }

  async findAll() {
    return this.renewalRequestsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByMember(memberId: number) {
    return this.renewalRequestsRepo.find({
      where: { member: { id: memberId } },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(id: string) {
    const request = await this.renewalRequestsRepo.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Renewal request ${id} not found`);
    }

    if (request.status === RenewalStatus.ACTIVATED) {
      throw new BadRequestException(
        'Activated renewal requests cannot be cancelled',
      );
    }

    request.status = RenewalStatus.CANCELLED;
    request.cancelledAt = new Date();
    return this.renewalRequestsRepo.save(request);
  }

  async handleInvoicePaid(invoiceId: string) {
    const request = await this.renewalRequestsRepo.findOne({
      where: { invoice: { invoice_id: invoiceId } },
    });

    if (!request || request.status === RenewalStatus.ACTIVATED) {
      return null;
    }

    request.status = RenewalStatus.PAID;
    await this.renewalRequestsRepo.save(request);

    const now = new Date();
    const subscription = request.currentSubscription;

    if (subscription) {
      subscription.plan = request.requestedPlan;
      subscription.isActive = true;

      if (subscription.endDate && subscription.endDate >= now) {
        const endDate = new Date(subscription.endDate);
        endDate.setDate(
          endDate.getDate() + request.requestedPlan.durationInDays,
        );
        subscription.endDate = endDate;
      } else {
        subscription.startDate = request.requestedStartDate;
        const endDate = new Date(request.requestedStartDate);
        endDate.setDate(
          endDate.getDate() + request.requestedPlan.durationInDays,
        );
        subscription.endDate = endDate;
      }

      await this.subscriptionsRepo.save(subscription);
    } else {
      const newSubscription = this.subscriptionsRepo.create({
        member: request.member,
        plan: request.requestedPlan,
        startDate: request.requestedStartDate,
        endDate: new Date(
          request.requestedStartDate.getTime() +
            request.requestedPlan.durationInDays * 24 * 60 * 60 * 1000,
        ),
        isActive: true,
      });
      const savedSubscription =
        await this.subscriptionsRepo.save(newSubscription);
      request.member.subscription = savedSubscription;
      request.member.subscriptionId = savedSubscription.id;
      await this.membersRepo.save(request.member);
    }

    request.status = RenewalStatus.ACTIVATED;
    request.activatedAt = now;
    const savedRequest = await this.renewalRequestsRepo.save(request);
    await this.remindersService.sendRenewalActivatedReminder(savedRequest);
    return savedRequest;
  }
}
