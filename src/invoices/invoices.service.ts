import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoices.entity';
import { Member } from '../entities/members.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
    @InjectRepository(Member)
    private membersRepo: Repository<Member>,
    @InjectRepository(MemberSubscription)
    private subscriptionsRepo: Repository<MemberSubscription>,
  ) {}

  async create(createDto: CreateInvoiceDto) {
    const member = await this.membersRepo.findOne({
      where: { id: createDto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createDto.memberId} not found`,
      );
    }

    let subscription: MemberSubscription | undefined;
    if (createDto.subscriptionId) {
      const foundSubscription = await this.subscriptionsRepo.findOne({
        where: { id: createDto.subscriptionId },
      });
      if (!foundSubscription) {
        throw new NotFoundException(
          `Subscription with ID ${createDto.subscriptionId} not found`,
        );
      }
      subscription = foundSubscription;
    }

    const invoice = this.invoicesRepo.create({
      member,
      subscription,
      total_amount: createDto.totalAmount,
      description: createDto.description,
      due_date: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
      status: 'pending',
    });

    return this.invoicesRepo.save(invoice);
  }

  async findAll() {
    return this.invoicesRepo.find({
      relations: ['member', 'subscription', 'payments'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { invoice_id: id },
      relations: ['member', 'subscription', 'payments'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findByMember(memberId: number) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    return this.invoicesRepo.find({
      where: { member: { id: memberId } },
      relations: ['member', 'subscription', 'payments'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    if (updateDto.totalAmount !== undefined) {
      invoice.total_amount = updateDto.totalAmount;
    }
    if (updateDto.description !== undefined) {
      invoice.description = updateDto.description;
    }
    if (updateDto.dueDate !== undefined) {
      invoice.due_date = updateDto.dueDate
        ? new Date(updateDto.dueDate)
        : undefined;
    }

    return this.invoicesRepo.save(invoice);
  }

  async cancelInvoice(id: string) {
    const invoice = await this.findOne(id);
    invoice.status = 'cancelled';
    return this.invoicesRepo.save(invoice);
  }

  async markAsPaid(id: string) {
    const invoice = await this.findOne(id);
    invoice.status = 'paid';
    return this.invoicesRepo.save(invoice);
  }
}
