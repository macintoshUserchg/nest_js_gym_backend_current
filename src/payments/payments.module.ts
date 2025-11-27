import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController, InvoicePaymentsController } from './payments.controller';
import { PaymentTransaction } from '../entities/payment_transactions.entity';
import { Invoice } from '../entities/invoices.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction, Invoice])],
  controllers: [PaymentsController, InvoicePaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
