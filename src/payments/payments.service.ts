import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { Invoice } from '../entities/invoices.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { RenewalsService } from '../renewals/renewals.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentsRepo: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
    private renewalsService: RenewalsService,
  ) {}

  async create(createDto: CreatePaymentDto, userId?: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { invoice_id: createDto.invoiceId },
      relations: ['payments'],
    });
    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${createDto.invoiceId} not found`,
      );
    }

    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Cannot add payment to cancelled invoice');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already paid');
    }

    const paymentStatus = createDto.status || 'completed';

    const payment = this.paymentsRepo.create({
      invoice,
      amount: createDto.amount,
      method: createDto.method,
      reference_number: createDto.referenceNumber,
      notes: createDto.notes,
      status: paymentStatus,
      recorded_by_user_id: userId,
      payment_date: createDto.payment_date
        ? new Date(createDto.payment_date)
        : new Date(),
    });

    const savedPayment = await this.paymentsRepo.save(payment);

    // Calculate total paid: sum of completed payments (excluding refunds and pending)
    const completedPayments = invoice.payments.filter(
      (p) => p.status === 'completed' && !p.original_transaction_id,
    );
    const totalPaid =
      completedPayments.reduce((sum, p) => sum + Number(p.amount), 0) +
      (paymentStatus === 'completed' ? Number(createDto.amount) : 0);

    // Mark invoice as paid only when status is completed and totalPaid >= total_amount
    if (paymentStatus === 'completed' && totalPaid >= Number(invoice.total_amount)) {
      invoice.status = 'paid';
      invoice.paid_at = new Date();
      await this.invoicesRepo.save(invoice);
      await this.renewalsService.handleInvoicePaid(invoice.invoice_id);
    }

    return savedPayment;
  }

  async findAll(filterDto?: PaymentFilterDto) {
    const qb = this.paymentsRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.member', 'member');

    if (filterDto) {
      if (filterDto.startDate) {
        qb.andWhere('payment.created_at >= :startDate', {
          startDate: filterDto.startDate,
        });
      }
      if (filterDto.endDate) {
        qb.andWhere('payment.created_at <= :endDate', {
          endDate: filterDto.endDate,
        });
      }
      if (filterDto.method) {
        qb.andWhere('payment.method = :method', { method: filterDto.method });
      }
      if (filterDto.status) {
        qb.andWhere('payment.status = :status', { status: filterDto.status });
      }
      if (filterDto.branchId) {
        qb.andWhere('member.branchBranchId = :branchId', {
          branchId: filterDto.branchId,
        });
      }
    }

    qb.orderBy('payment.created_at', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepo.findOne({
      where: { transaction_id: id },
      relations: ['invoice', 'invoice.member'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByInvoice(invoiceId: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { invoice_id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    return this.paymentsRepo.find({
      where: { invoice: { invoice_id: invoiceId } },
      relations: ['invoice'],
      order: { created_at: 'DESC' },
    });
  }

  async findByMember(memberId: number) {
    const payments = await this.paymentsRepo.find({
      where: {
        invoice: {
          member: { id: memberId },
        },
      },
      relations: ['invoice', 'invoice.member'],
      order: { created_at: 'DESC' },
    });

    return payments;
  }

  async verifyPayment(
    transactionId: string,
    updateDto: UpdatePaymentDto,
    verifiedByUserId: string,
  ) {
    const payment = await this.paymentsRepo.findOne({
      where: { transaction_id: transactionId },
      relations: ['invoice', 'invoice.payments'],
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${transactionId} not found`,
      );
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException(
        `Cannot verify payment with status '${payment.status}'. Only pending payments can be verified.`,
      );
    }

    payment.status = updateDto.status;
    payment.verified_by_user_id = verifiedByUserId;
    payment.verified_at = new Date();

    const savedPayment = await this.paymentsRepo.save(payment);

    // If completed, recalculate invoice total and mark as paid if appropriate
    if (updateDto.status === 'completed') {
      const invoice = payment.invoice;
      const completedPayments = invoice.payments.filter(
        (p) =>
          p.status === 'completed' && !p.original_transaction_id,
      );
      const totalPaid = completedPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      if (totalPaid >= Number(invoice.total_amount)) {
        invoice.status = 'paid';
        invoice.paid_at = new Date();
        await this.invoicesRepo.save(invoice);
        await this.renewalsService.handleInvoicePaid(invoice.invoice_id);
      }
    }

    return savedPayment;
  }

  async refundPayment(
    transactionId: string,
    refundDto: RefundPaymentDto,
    userId: string,
  ) {
    const payment = await this.paymentsRepo.findOne({
      where: { transaction_id: transactionId },
      relations: ['invoice'],
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${transactionId} not found`,
      );
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException(
        `Cannot refund payment with status '${payment.status}'. Only completed payments can be refunded.`,
      );
    }

    if (refundDto.amount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    if (refundDto.amount > Number(payment.amount)) {
      throw new BadRequestException(
        'Refund amount cannot exceed the original payment amount',
      );
    }

    // Calculate total already refunded for this original transaction
    const existingRefunds = await this.paymentsRepo.find({
      where: {
        original_transaction_id: transactionId,
        status: 'refund',
      },
    });
    const totalAlreadyRefunded = existingRefunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );

    if (
      refundDto.amount >
      Number(payment.amount) - totalAlreadyRefunded
    ) {
      throw new BadRequestException(
        `Refund amount would exceed remaining refundable amount. Maximum refundable: ${(Number(payment.amount) - totalAlreadyRefunded).toFixed(2)}`,
      );
    }

    // Create refund transaction
    const refundTransaction = this.paymentsRepo.create({
      invoice: payment.invoice,
      amount: refundDto.amount,
      method: refundDto.refundMethod,
      status: 'refund',
      refund_reason: refundDto.reason,
      notes: refundDto.notes,
      original_transaction_id: transactionId,
      recorded_by_user_id: userId,
      payment_date: new Date(),
    });

    const savedRefund = await this.paymentsRepo.save(refundTransaction);

    // Recalculate invoice total paid (completed payments only, excluding refunds and pending)
    const invoice = await this.invoicesRepo.findOne({
      where: { invoice_id: payment.invoice.invoice_id },
    });
    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${payment.invoice.invoice_id} not found`,
      );
    }

    const completedPayments = await this.paymentsRepo.find({
      where: {
        invoice: { invoice_id: payment.invoice.invoice_id },
        status: 'completed',
      },
    });

    const totalPaid = completedPayments
      .filter((p) => !p.original_transaction_id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaid < Number(invoice.total_amount)) {
      invoice.status = 'pending';
      invoice.paid_at = undefined;
      await this.invoicesRepo.save(invoice);
    }

    return savedRefund;
  }

  async getPaymentSummary(invoiceId: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { invoice_id: invoiceId },
      relations: ['payments'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const payments = invoice.payments || [];
    const completedPayments = payments.filter(
      (p) => p.status === 'completed' && !p.original_transaction_id,
    );
    const refundPayments = payments.filter((p) => p.status === 'refund');

    const totalAmount = Number(invoice.total_amount);
    const totalPaid = completedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const totalRefunded = refundPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remainingBalance = totalAmount - totalPaid;
    const paymentCount = completedPayments.length;

    const sortedPayments = [...payments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return {
      totalAmount,
      totalPaid,
      totalRefunded,
      remainingBalance,
      paymentCount,
      payments: sortedPayments,
    };
  }

  async getPaymentsSummary(filterDto?: PaymentFilterDto) {
    const qb = this.paymentsRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .leftJoin('invoice.member', 'member')
      .where('payment.status = :completedStatus', { completedStatus: 'completed' })
      .andWhere('payment.original_transaction_id IS NULL');

    if (filterDto) {
      if (filterDto.startDate) {
        qb.andWhere('payment.created_at >= :startDate', {
          startDate: filterDto.startDate,
        });
      }
      if (filterDto.endDate) {
        qb.andWhere('payment.created_at <= :endDate', {
          endDate: filterDto.endDate,
        });
      }
      if (filterDto.branchId) {
        qb.andWhere('member.branchBranchId = :branchId', {
          branchId: filterDto.branchId,
        });
      }
    }

    // Get grand total and count
    const summaryResult = await qb
      .select('SUM(payment.amount)', 'grandTotal')
      .addSelect('COUNT(payment.transaction_id)', 'totalCount')
      .getRawOne();

    const grandTotal = Number(summaryResult?.grandTotal) || 0;
    const totalCount = Number(summaryResult?.totalCount) || 0;

    // Get total by method
    const methodQb = this.paymentsRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .leftJoin('invoice.member', 'member')
      .where('payment.status = :completedStatus', { completedStatus: 'completed' })
      .andWhere('payment.original_transaction_id IS NULL');

    if (filterDto) {
      if (filterDto.startDate) {
        methodQb.andWhere('payment.created_at >= :startDate', {
          startDate: filterDto.startDate,
        });
      }
      if (filterDto.endDate) {
        methodQb.andWhere('payment.created_at <= :endDate', {
          endDate: filterDto.endDate,
        });
      }
      if (filterDto.branchId) {
        methodQb.andWhere('member.branchBranchId = :branchId', {
          branchId: filterDto.branchId,
        });
      }
    }

    const methodResults = await methodQb
      .select('payment.method', 'method')
      .addSelect('SUM(payment.amount)', 'total')
      .addSelect('COUNT(payment.transaction_id)', 'count')
      .groupBy('payment.method')
      .getRawMany();

    const totalByMethod = methodResults.map((r) => ({
      method: r.method,
      total: Number(r.total),
      count: Number(r.count),
    }));

    return {
      grandTotal,
      totalCount,
      totalByMethod,
    };
  }

  async getReceipt(transactionId: string) {
    const payment = await this.paymentsRepo.findOne({
      where: { transaction_id: transactionId },
      relations: [
        'invoice',
        'invoice.member',
        'recorded_by',
        'verified_by',
      ],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${transactionId} not found`,
      );
    }

    const invoice = payment.invoice;

    // Calculate total paid on this invoice (completed payments only)
    const completedPayments = await this.paymentsRepo.find({
      where: {
        invoice: { invoice_id: invoice.invoice_id },
        status: 'completed',
      },
    });

    const totalPaid = completedPayments
      .filter((p) => !p.original_transaction_id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remainingBalance = Number(invoice.total_amount) - totalPaid;

    const member = invoice.member;

    return {
      payment,
      invoice: {
        invoice_id: invoice.invoice_id,
        total_amount: Number(invoice.total_amount),
        status: invoice.status,
        due_date: invoice.due_date,
        description: invoice.description,
      },
      member: member
        ? {
            id: member.id,
            fullName: member.fullName,
            email: member.email,
            phone: member.phone,
          }
        : null,
      receipt: {
        issuedAt: new Date(),
        paymentId: payment.transaction_id,
        amount: Number(payment.amount),
        method: payment.method,
        referenceNumber: payment.reference_number,
        paymentDate: payment.payment_date,
        status: payment.status,
      },
    };
  }
}
