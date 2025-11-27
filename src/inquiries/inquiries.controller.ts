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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { InquiriesService, InquiryFilters } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryResponseDto } from './dto/inquiry-response.dto';
import { InquiryStatus } from '../entities/inquiry.entity';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inquiry' })
  @ApiBody({ type: CreateInquiryDto })
  @ApiResponse({
    status: 201,
    description: 'Inquiry created successfully',
    type: InquiryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Inquiry with this email already exists',
  })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inquiries with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of inquiries retrieved successfully',
    type: 'array',
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
  @ApiOperation({ summary: 'Get pending inquiries (new and contacted)' })
  @ApiResponse({
    status: 200,
    description: 'List of pending inquiries',
    type: 'array',
  })
  async getPendingInquiries() {
    return this.inquiriesService.getPendingInquiries();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inquiry statistics' })
  @ApiResponse({
    status: 200,
    description: 'Inquiry statistics',
  })
  async getStats() {
    return this.inquiriesService.getInquiryStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry by ID' })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Inquiry found successfully',
    type: InquiryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get inquiry by email' })
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
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findByEmail(@Param('email') email: string) {
    return this.inquiriesService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inquiry' })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiBody({ type: UpdateInquiryDto })
  @ApiResponse({
    status: 200,
    description: 'Inquiry updated successfully',
    type: InquiryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInquiryDto: UpdateInquiryDto,
  ) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update inquiry status' })
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
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(InquiryStatus)) status: InquiryStatus,
  ) {
    return this.inquiriesService.updateStatus(id, status);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert inquiry to member' })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Inquiry converted to member successfully',
    type: InquiryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async convertToMember(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.convertToMember(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inquiry' })
  @ApiParam({ name: 'id', description: 'Inquiry ID', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Inquiry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiriesService.remove(id);
  }
}
