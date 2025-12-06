import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import {
  InvoicesController,
  MemberInvoicesController,
} from './invoices.controller';
import { Invoice } from '../entities/invoices.entity';
import { Member } from '../entities/members.entity';
import { MemberSubscription } from '../entities/member_subscriptions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Member, MemberSubscription])],
  controllers: [InvoicesController, MemberInvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
