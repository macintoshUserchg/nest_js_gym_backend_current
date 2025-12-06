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

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentsRepo: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private invoicesRepo: Repository<Invoice>,
  ) {}

  async create(createDto: CreatePaymentDto) {
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

    const payment = this.paymentsRepo.create({
      invoice,
      amount: createDto.amount,
      method: createDto.method,
      reference_number: createDto.referenceNumber,
      notes: createDto.notes,
      status: 'completed',
    });

    const savedPayment = await this.paymentsRepo.save(payment);

    // Calculate total paid amount
    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) +
      Number(createDto.amount);

    // Mark invoice as paid if total paid >= total amount
    if (totalPaid >= Number(invoice.total_amount)) {
      invoice.status = 'paid';
      await this.invoicesRepo.save(invoice);
    }

    return savedPayment;
  }

  async findAll() {
    return this.paymentsRepo.find({
      relations: ['invoice', 'invoice.member'],
      order: { created_at: 'DESC' },
    });
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
}
