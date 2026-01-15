import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseEnumPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InquiriesService, InquiryFilters } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryResponseDto } from './dto/inquiry-response.dto';
import { InquiryStatus } from '../entities/inquiry.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new inquiry (Public)',
    description:
      'Public endpoint for lead capture - creates a new inquiry from potential customers. No authentication required. Use this endpoint for contact forms and lead generation.',
  })
  @ApiBody({ type: CreateInquiryDto })
  @ApiResponse({
    status: 201,
    description: 'Inquiry created successfully',
    type: InquiryResponseDto,
    examples: {
      success: {
        summary: 'Successful inquiry creation',
        value: {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          message: 'Interested in personal training',
          source: 'website',
          status: 'NEW',
          branchId: 'branch-123',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    examples: {
      invalidData: {
        summary: 'Validation error',
        value: {
          statusCode: 400,
          message: [
            'email must be an email',
            'fullName must be longer than or equal to 2 characters',
          ],
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Inquiry with this email already exists',
    examples: {
      duplicate: {
        summary: 'Duplicate email',
        value: {
          statusCode: 409,
          message: 'Inquiry with this email already exists',
          error: 'Conflict',
        },
      },
    },
  })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all inquiries (Admin)',
    description:
      'Admin-only endpoint to retrieve all inquiries with advanced filtering and pagination. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of inquiries retrieved successfully',
    type: 'array',
    examples: {
      success: {
        summary: 'List of inquiries',
        value: [
          {
            id: 1,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            message: 'Interested in personal training',
            source: 'website',
            status: 'NEW',
            branchId: 'branch-123',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    examples: {
      unauthorized: {
        summary: 'Missing or invalid token',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    examples: {
      forbidden: {
        summary: 'Insufficient permissions',
        value: {
          statusCode: 403,
          message: 'Forbidden resource',
        },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: InquiryStatus,
  })
  @ApiQuery({
    name: 'source',
    required: false,
    description: 'Filter by source',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
  })
  @ApiQuery({ name: 'email', required: false, description: 'Search by email' })
  @ApiQuery({ name: 'phone', required: false, description: 'Search by phone' })
  @ApiQuery({
    name: 'fullName',
    required: false,
    description: 'Search by full name',
  })
  @ApiQuery({
    name: 'createdFrom',
    required: false,
    description: 'Filter by creation date from',
  })
  @ApiQuery({
    name: 'createdTo',
    required: false,
    description: 'Filter by creation date to',
  })
  @ApiQuery({
    name: 'convertedOnly',
    required: false,
    description: 'Show only converted inquiries',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new ParseEnumPipe(InquiryStatus)) status?: InquiryStatus,
    @Query('source') source?: string,
    @Query('branchId') branchId?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('fullName') fullName?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
    @Query('convertedOnly') convertedOnly?: boolean,
  ) {
    const filters: InquiryFilters = {
      status,
      source,
      branchId,
      email,
      phone,
      fullName,
      createdFrom: createdFrom ? new Date(createdFrom) : undefined,
      createdTo: createdTo ? new Date(createdTo) : undefined,
      convertedOnly,
    };

    return this.inquiriesService.findAll(page, limit, filters);
  }

  @Get('pending')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get pending inquiries (Admin)',
    description:
      'Admin-only endpoint to retrieve pending inquiries (NEW and CONTACTED status). Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending inquiries',
    type: 'array',
    examples: {
      success: {
        summary: 'Pending inquiries list',
        value: [
          {
            id: 1,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            status: 'NEW',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getPendingInquiries() {
    return this.inquiriesService.getPendingInquiries();
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get inquiry statistics (Admin)',
    description:
      'Admin-only endpoint to get inquiry statistics and analytics. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inquiry statistics',
    examples: {
      success: {
        summary: 'Statistics data',
        value: {
          total: 150,
          new: 25,
          contacted: 35,
          converted: 65,
          lost: 25,
          bySource: {
            website: 80,
            social: 40,
            referral: 30,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getStats() {
    return this.inquiriesService.getInquiryStats();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get inquiry by ID (Admin)',
    description:
      'Admin-only endpoint to retrieve a specific inquiry by ID. Requires JWT authentication.',
  })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Inquiry found successfully',
    type: InquiryResponseDto,
    examples: {
      success: {
        summary: 'Inquiry details',
        value: {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          message: 'Interested in personal training',
          source: 'website',
          status: 'NEW',
          branchId: 'branch-123',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.findOne(id);
  }

  @Get('email/:email')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get inquiry by email (Admin)',
    description:
      'Admin-only endpoint to find inquiry by customer email. Requires JWT authentication.',
  })
  @ApiParam({
    name: 'email',
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Inquiry found successfully',
    type: InquiryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findByEmail(@Param('email') email: string) {
    return this.inquiriesService.findByEmail(email);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update inquiry (Admin)',
    description:
      'Admin-only endpoint to update inquiry details. Requires JWT authentication.',
  })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiBody({ type: UpdateInquiryDto })
  @ApiResponse({
    status: 200,
    description: 'Inquiry updated successfully',
    type: InquiryResponseDto,
    examples: {
      success: {
        summary: 'Updated inquiry',
        value: {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567891',
          message: 'Updated message',
          source: 'website',
          status: 'CONTACTED',
          branchId: 'branch-123',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T11:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInquiryDto: UpdateInquiryDto,
  ) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update inquiry status (Admin)',
    description:
      'Admin-only endpoint to update inquiry status (NEW, CONTACTED, CONVERTED, LOST). Requires JWT authentication.',
  })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(InquiryStatus),
          example: InquiryStatus.CONTACTED,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Inquiry status updated successfully',
    type: InquiryResponseDto,
    examples: {
      success: {
        summary: 'Status updated',
        value: {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          status: 'CONTACTED',
          updatedAt: '2024-01-15T11:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(InquiryStatus)) status: InquiryStatus,
  ) {
    return this.inquiriesService.updateStatus(id, status);
  }

  @Post(':id/convert')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Convert inquiry to member (Admin)',
    description:
      'Admin-only endpoint to convert an inquiry into a full member account. Creates a member profile and user account. Requires JWT authentication.',
  })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Inquiry converted to member successfully',
    type: InquiryResponseDto,
    examples: {
      success: {
        summary: 'Converted to member',
        value: {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          status: 'CONVERTED',
          convertedToMemberId: 123,
          updatedAt: '2024-01-15T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @ApiResponse({
    status: 409,
    description: 'Inquiry already converted or email already exists as member',
  })
  async convertToMember(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.convertToMember(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete inquiry (Admin)',
    description:
      'Admin-only endpoint to permanently delete an inquiry. This action cannot be undone. Requires JWT authentication.',
  })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Inquiry deleted successfully',
    examples: {
      success: {
        summary: 'Inquiry deleted',
        value: {
          message: 'Inquiry deleted successfully',
          deletedInquiryId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.remove(id);
  }
}
