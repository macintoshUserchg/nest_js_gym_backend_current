import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import {
  PaymentsController,
  InvoicePaymentsController,
  MemberPaymentsController,
} from './payments.controller';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { Invoice } from '../entities/invoices.entity';
import { User } from '../entities/users.entity';
import { RenewalsModule } from '../renewals/renewals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction, Invoice, User]),
    RenewalsModule,
  ],
  controllers: [
    PaymentsController,
    InvoicePaymentsController,
    MemberPaymentsController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
