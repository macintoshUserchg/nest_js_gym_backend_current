import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(createDto);
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
  findAll() {
    return this.paymentsService.findAll();
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
}
