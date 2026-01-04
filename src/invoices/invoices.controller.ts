import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Invoice } from '../entities/invoices.entity';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create invoice',
    description:
      'Creates a new invoice for a member, typically for membership fees, personal training sessions, or other gym services. The invoice can be associated with a subscription for recurring billing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully.',
    type: Invoice,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member or subscription not found.',
    examples: {
      memberNotFound: {
        summary: 'Member not found',
        value: {
          statusCode: 404,
          message: 'Member with ID 123 not found',
          error: 'Not Found',
        },
      },
      subscriptionNotFound: {
        summary: 'Subscription not found',
        value: {
          statusCode: 404,
          message: 'Subscription with ID 456 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: CreateInvoiceDto,
    examples: {
      membershipFee: {
        summary: 'Monthly membership fee invoice',
        value: {
          memberId: 123,
          subscriptionId: 1,
          totalAmount: 99.99,
          description: 'Monthly membership fee - December 2024',
          dueDate: '2024-12-31',
        },
      },
      personalTraining: {
        summary: 'Personal training session invoice',
        value: {
          memberId: 123,
          totalAmount: 75.0,
          description: 'Personal training session with Trainer John',
          dueDate: '2024-12-15',
        },
      },
    },
  })
  create(@Body() createDto: CreateInvoiceDto) {
    return this.invoicesService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all invoices',
    description:
      'Retrieves all invoices in the system with optional filtering by status, member, or date range. This endpoint is typically restricted to admin and finance staff.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all invoices.',
    type: [Invoice],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access invoices.',
  })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get invoice by ID',
    description:
      'Retrieves detailed information about a specific invoice including payment status, member details, and associated payments. This is useful for billing inquiries and financial reporting.',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the invoice.',
    examples: {
      success: {
        summary: 'Invoice details',
        value: {
          invoice_id: '123e4567-e89b-12d3-a456-426614174000',
          member: {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          subscription: {
            id: 1,
            planName: 'Premium Membership',
          },
          total_amount: 99.99,
          description: 'Monthly membership fee - December 2024',
          due_date: '2024-12-31',
          status: 'pending',
          payments: [
            {
              transaction_id: '456e7890-e89b-12d3-a456-426614174001',
              amount: 50.0,
              method: 'card',
              status: 'completed',
              created_at: '2024-12-01T10:00:00Z',
            },
          ],
          created_at: '2024-12-01T00:00:00Z',
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
      'Forbidden - Insufficient permissions to access invoice details.',
  })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update invoice',
    description:
      'Updates invoice information such as amount, description, due date, or payment status. This endpoint is typically used by finance staff to correct billing errors or update payment terms.',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully.',
    examples: {
      success: {
        summary: 'Invoice updated successfully',
        value: {
          invoice_id: '123e4567-e89b-12d3-a456-426614174000',
          member: {
            id: 123,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          total_amount: 109.99,
          description: 'Monthly membership fee - December 2024 (Updated)',
          due_date: '2025-01-15',
          status: 'pending',
          updated_at: '2024-12-02T00:00:00Z',
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
    description: 'Forbidden - Insufficient permissions to update invoices.',
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    examples: {
      updateAmount: {
        summary: 'Update invoice amount',
        value: {
          totalAmount: 109.99,
          description:
            'Monthly membership fee - December 2024 (Late fee applied)',
        },
      },
      updateDueDate: {
        summary: 'Extend payment due date',
        value: {
          dueDate: '2025-01-15',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateDto);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cancel invoice',
    description:
      'Cancels an invoice, changing its status to "cancelled". This is typically done when an invoice was created in error, the service was not provided, or the member has been granted a refund. Cancelled invoices cannot be paid.',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully.',
    examples: {
      success: {
        summary: 'Invoice cancelled successfully',
        value: {
          message: 'Invoice has been successfully cancelled',
          invoice_id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'cancelled',
          cancelled_at: '2024-12-02T10:30:00Z',
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
    status: 409,
    description:
      'Invoice cannot be cancelled - already paid or in invalid state.',
    examples: {
      alreadyPaid: {
        summary: 'Invoice already paid',
        value: {
          statusCode: 409,
          message:
            'Invoice cannot be cancelled because it has already been paid',
          error: 'Conflict',
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
    description: 'Forbidden - Insufficient permissions to cancel invoices.',
  })
  cancelInvoice(@Param('id') id: string) {
    return this.invoicesService.cancelInvoice(id);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':memberId/invoices')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get member invoices',
    description:
      'Retrieves all invoices associated with a specific member, including payment status and outstanding balances. This is useful for billing inquiries and member account management.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member ID (numeric)',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Return member invoices.',
    examples: {
      success: {
        summary: 'Member invoices list',
        value: [
          {
            invoice_id: '123e4567-e89b-12d3-a456-426614174000',
            total_amount: 99.99,
            description: 'Monthly membership fee - December 2024',
            due_date: '2024-12-31',
            status: 'pending',
            created_at: '2024-12-01T00:00:00Z',
          },
          {
            invoice_id: '456e7890-e89b-12d3-a456-426614174001',
            total_amount: 75.0,
            description: 'Personal training session',
            due_date: '2024-11-30',
            status: 'paid',
            created_at: '2024-11-15T00:00:00Z',
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
      'Forbidden - Insufficient permissions to access member invoices.',
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.invoicesService.findByMember(memberId);
  }
}
