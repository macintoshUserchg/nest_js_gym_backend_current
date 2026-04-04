import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { paginate } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { PaymentTransaction } from '../entities/payment_transactions.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Record payment',
    description:
      'Records a new payment transaction for an invoice. This endpoint handles various payment methods including cash, card, online payments, and bank transfers. The payment amount is validated against the invoice total.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully.',
    type: PaymentTransaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment data or amount exceeds invoice total.',
    examples: {
      invalidAmount: {
        summary: 'Payment amount exceeds invoice total',
        value: {
          statusCode: 400,
          message: 'Payment amount (150.00) exceeds invoice total (99.99)',
          error: 'Bad Request',
        },
      },
      invalidMethod: {
        summary: 'Invalid payment method',
        value: {
          statusCode: 400,
          message:
            'Payment method must be one of: cash, card, online, bank_transfer',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to record payments.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
    examples: {
      invoiceNotFound: {
        summary: 'Invoice not found',
        value: {
          statusCode: 404,
          message:
            'Invoice with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: CreatePaymentDto,
    examples: {
      cardPayment: {
        summary: 'Credit card payment',
        value: {
          invoiceId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 99.99,
          method: 'card',
          referenceNumber: 'TXN123456789',
          notes: 'Paid via Visa ending in 1234',
        },
      },
      cashPayment: {
        summary: 'Cash payment at reception',
        value: {
          invoiceId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 75.0,
          method: 'cash',
          notes: 'Cash payment received at front desk',
        },
      },
      bankTransfer: {
        summary: 'Bank transfer payment',
        value: {
          invoiceId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 199.99,
          method: 'bank_transfer',
          referenceNumber: 'UTR789012345',
          notes: 'Bank transfer from member account',
        },
      },
    },
  })
  create(@Body() createDto: CreatePaymentDto, @CurrentUser() user: User) {
    return this.paymentsService.create(createDto, user?.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all payments',
    description:
      'Retrieves all payment transactions in the system with optional filtering by payment method, status, or date range. This endpoint is typically restricted to finance staff and administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all payments.',
    type: [PaymentTransaction],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access payment records.',
  })
  findAll(@Query() filterDto: PaymentFilterDto) {
    return this.paymentsService.findAll(filterDto);
  }

  @Get('export/csv')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export payments as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file of payments.' })
  async exportCsv(@Query() filterDto: PaymentFilterDto, @Res() res: any) {
    const payments = await this.paymentsService.exportAll(filterDto);
    const data = payments.map((p: any) => ({
      transaction_id: p.transaction_id,
      amount: p.amount,
      method: p.method,
      status: p.status,
      reference_number: p.reference_number,
      payment_date: p.payment_date,
      created_at: p.created_at,
    }));
    const columns = [
      'transaction_id',
      'amount',
      'method',
      'status',
      'reference_number',
      'payment_date',
      'created_at',
    ];
    const csv = this.paymentsService.toCsv(data, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res.send(csv);
  }

  @Get('summary')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get payment summary report',
    description:
      'Returns an aggregated payment report with totals, counts, and breakdowns by method and status. Supports date range, method, and status filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return payment summary report.',
    examples: {
      success: {
        summary: 'Payment summary report',
        value: {
          totalAmount: 12500.0,
          totalTransactions: 150,
          byMethod: {
            cash: { count: 40, total: 3000.0 },
            card: { count: 80, total: 7000.0 },
            online: { count: 20, total: 1500.0 },
            bank_transfer: { count: 10, total: 1000.0 },
          },
          byStatus: {
            completed: { count: 140, total: 12000.0 },
            pending: { count: 5, total: 300.0 },
            failed: { count: 3, total: 100.0 },
            refund: { count: 2, total: 100.0 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access payment reports.',
  })
  getSummary(@Query() filterDto: PaymentFilterDto) {
    return this.paymentsService.getPaymentsSummary(filterDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get payment by ID',
    description:
      'Retrieves detailed information about a specific payment transaction including the associated invoice, payment method, and transaction details. This is useful for payment inquiries and financial reconciliation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the payment.',
    examples: {
      success: {
        summary: 'Payment transaction details',
        value: {
          transaction_id: '123e4567-e89b-12d3-a456-426614174000',
          invoice: {
            invoice_id: '456e7890-e89b-12d3-a456-426614174001',
            member: {
              id: 123,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
            total_amount: 99.99,
          },
          amount: 99.99,
          method: 'card',
          reference_number: 'TXN123456789',
          notes: 'Paid via Visa ending in 1234',
          status: 'completed',
          created_at: '2024-12-01T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found.',
    examples: {
      notFound: {
        summary: 'Payment ID not found',
        value: {
          statusCode: 404,
          message:
            'Payment with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access payment details.',
  })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify or reject payment',
    description:
      'Allows an admin to verify (approve) or reject a pending payment transaction. The verifying user is recorded for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdatePaymentDto,
    examples: {
      verify: {
        summary: 'Verify payment',
        value: {
          status: 'completed',
          notes: 'Payment verified by admin',
        },
      },
      reject: {
        summary: 'Reject payment',
        value: {
          status: 'failed',
          notes: 'Payment rejected - insufficient funds',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified or rejected successfully.',
    type: PaymentTransaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition.',
    examples: {
      invalidTransition: {
        summary: 'Invalid status transition',
        value: {
          statusCode: 400,
          message: 'Cannot update a refund payment status',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to verify payments.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found.',
    examples: {
      notFound: {
        summary: 'Payment ID not found',
        value: {
          statusCode: 404,
          message:
            'Payment with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  verifyPayment(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.verifyPayment(id, updateDto, user.userId);
  }

  @Post(':id/refund')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Issue payment refund',
    description:
      'Issues a refund for a completed payment transaction. The refund amount, method, and reason are recorded for audit and reconciliation purposes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: RefundPaymentDto,
    examples: {
      fullRefund: {
        summary: 'Full refund',
        value: {
          amount: 99.99,
          refundMethod: 'card',
          reason: 'Duplicate payment processed',
          notes: 'Refund approved by manager',
        },
      },
      partialRefund: {
        summary: 'Partial refund',
        value: {
          amount: 50.0,
          refundMethod: 'cash',
          reason: 'Service not delivered as described',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Refund issued successfully.',
    type: PaymentTransaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refund data or refund amount exceeds payment amount.',
    examples: {
      exceedsAmount: {
        summary: 'Refund amount exceeds payment',
        value: {
          statusCode: 400,
          message: 'Refund amount (150.00) exceeds payment amount (99.99)',
          error: 'Bad Request',
        },
      },
      notRefundable: {
        summary: 'Payment not refundable',
        value: {
          statusCode: 400,
          message: 'Only completed payments can be refunded',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to issue refunds.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found.',
    examples: {
      notFound: {
        summary: 'Payment ID not found',
        value: {
          statusCode: 404,
          message:
            'Payment with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  refundPayment(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.refundPayment(id, refundDto, user.userId);
  }
}

@ApiTags('invoices')
@Controller('invoices')
export class InvoicePaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':invoiceId/payments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get invoice payments',
    description:
      'Retrieves all payment transactions associated with a specific invoice. This is useful for tracking partial payments, payment history, and invoice reconciliation.',
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'Invoice ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return invoice payments.',
    examples: {
      success: {
        summary: 'Invoice payments list',
        value: [
          {
            transaction_id: '123e4567-e89b-12d3-a456-426614174000',
            amount: 50.0,
            method: 'card',
            reference_number: 'TXN123456789',
            notes: 'Partial payment via credit card',
            status: 'completed',
            created_at: '2024-12-01T10:30:00Z',
          },
          {
            transaction_id: '456e7890-e89b-12d3-a456-426614174001',
            amount: 49.99,
            method: 'cash',
            notes: 'Remaining balance paid in cash',
            status: 'completed',
            created_at: '2024-12-02T14:15:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
    examples: {
      notFound: {
        summary: 'Invoice ID not found',
        value: {
          statusCode: 404,
          message:
            'Invoice with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access invoice payments.',
  })
  findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }

  @Get(':invoiceId/payment-summary')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get invoice payment summary',
    description:
      'Returns a summary of payments for a specific invoice including total paid, remaining balance, payment count, and breakdown by method.',
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'Invoice ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return invoice payment summary.',
    examples: {
      success: {
        summary: 'Invoice payment summary',
        value: {
          invoiceId: '123e4567-e89b-12d3-a456-426614174000',
          totalAmount: 200.0,
          totalPaid: 175.0,
          remainingBalance: 25.0,
          paymentCount: 3,
          isFullyPaid: false,
          byMethod: {
            cash: { count: 1, total: 50.0 },
            card: { count: 2, total: 125.0 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
    examples: {
      notFound: {
        summary: 'Invoice ID not found',
        value: {
          statusCode: 404,
          message:
            'Invoice with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access invoice payment summary.',
  })
  getInvoicePaymentSummary(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.getPaymentSummary(invoiceId);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':memberId/payments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get member payment history',
    description:
      'Retrieves complete payment history for a specific member including all transactions across different invoices. This is useful for financial reporting and member account management.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member ID (numeric)',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Return member payment history.',
    examples: {
      success: {
        summary: 'Member payment history',
        value: [
          {
            transaction_id: '123e4567-e89b-12d3-a456-426614174000',
            invoice: {
              invoice_id: '456e7890-e89b-12d3-a456-426614174001',
              description: 'Monthly membership fee - December 2024',
              total_amount: 99.99,
            },
            amount: 99.99,
            method: 'card',
            reference_number: 'TXN123456789',
            notes: 'Paid via Visa ending in 1234',
            status: 'completed',
            created_at: '2024-12-01T10:30:00Z',
          },
          {
            transaction_id: '789e0123-e89b-12d3-a456-426614174002',
            invoice: {
              invoice_id: '890e1234-e89b-12d3-a456-426614174003',
              description: 'Personal training session',
              total_amount: 75.0,
            },
            amount: 75.0,
            method: 'cash',
            status: 'completed',
            created_at: '2024-11-28T15:45:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
    examples: {
      notFound: {
        summary: 'Member ID not found',
        value: {
          statusCode: 404,
          message: 'Member with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access member payment history.',
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.paymentsService.findByMember(memberId);
  }

  @Get('daily-cash-report')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get daily cash report',
    description:
      'Returns a breakdown of cash vs non-cash payments for a specific date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily cash report.',
  })
  getDailyCashReport(@Query('date') date?: string) {
    return this.paymentsService.getDailyCashReport(date);
  }

  @Post('bulk')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Bulk create payments',
    description: 'Record multiple payments in a single request.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk payments processed.',
  })
  bulkCreatePayments(
    @Body() payments: CreatePaymentDto[],
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.bulkCreatePayments(payments, user?.userId);
  }

  @Get('reconciliation')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get reconciliation report',
    description:
      'Returns a reconciliation report for a date range (defaults to current month).',
  })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation report.',
  })
  getReconciliationReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getReconciliationReport(startDate, endDate);
  }

  @Get(':id/receipt')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get payment receipt',
    description: 'Returns a formatted receipt for a specific payment.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment receipt.',
  })
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }
}
