import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Member } from '../entities/members.entity';
import { MemberDashboardDto } from './dto/member-dashboard.dto';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new member',
    description:
      'Creates a new member profile with branch assignment and default user account',
  })
  @ApiResponse({
    status: 201,
    description: 'Member created successfully.',
    type: Member,
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
    status: 409,
    description: 'Member with this email already exists.',
  })
  @ApiBody({
    type: CreateMemberDto,
    examples: {
      minimalMember: {
        summary: 'Create a member with minimal required information',
        value: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          branchId: '123e4567-e89b-12d3-a456-426614174000',
          membershipPlanId: 1,
        },
      },
      completeMember: {
        summary: 'Create a member with complete information',
        value: {
          fullName: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          phone: '+1987654321',
          gender: 'FEMALE',
          dateOfBirth: '1992-05-15',
          addressLine1: '456 Oak Avenue',
          addressLine2: 'Apt 3B',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          avatarUrl: 'https://example.com/avatars/alice.jpg',
          emergencyContactName: 'Robert Johnson',
          emergencyContactPhone: '+1122334455',
          branchId: '456e7890-e89b-12d3-a456-426614174001',
          membershipPlanId: 2,
          isActive: true,
        },
      },
      basicMember: {
        summary: 'Create a member with basic information',
        value: {
          fullName: 'Michael Smith',
          email: 'michael.smith@example.com',
          phone: '+1555123456',
          gender: 'MALE',
          dateOfBirth: '1985-12-10',
          city: 'Chicago',
          state: 'IL',
          branchId: '789e0123-e89b-12d3-a456-426614174002',
          membershipPlanId: 3,
        },
      },
    },
  })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all members',
    description:
      'Retrieve all members with optional filtering by branch, status, or search',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter members by branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by membership status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search members by name or email',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all members.',
    type: [Member],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.membersService.findAll(branchId, status, search);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a member by ID',
    description:
      'Retrieves detailed information about a specific member including membership status and recent activity.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the member.',
    examples: {
      success: {
        summary: 'Member details',
        value: {
          id: 123,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          isActive: true,
          freezMember: false,
          branchBranchId: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a member',
    description:
      'Updates member information such as personal details, contact information, or membership status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully.',
    examples: {
      success: {
        summary: 'Member updated successfully',
        value: {
          id: 123,
          fullName: 'John Updated',
          email: 'john.updated@example.com',
          phone: '+1234567891',
          dateOfBirth: '1990-01-01',
          addressLine1: '456 New St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          isActive: true,
          freezMember: false,
          updatedAt: '2024-01-02T00:00:00Z',
        },
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
    status: 409,
    description: 'Member with this email already exists.',
    examples: {
      duplicateEmail: {
        summary: 'Email already exists',
        value: {
          statusCode: 409,
          message: 'Member with this email already exists',
          error: 'Conflict',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateMemberDto,
    examples: {
      updateContact: {
        summary: 'Update member contact information',
        value: {
          phone: '+1234567891',
          address: '456 New St, City, State',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a member',
    description:
      'Permanently deletes a member account and all associated data including subscriptions, workout plans, diet plans, attendance records, and progress tracking. Requires admin privileges. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID (numeric)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description:
      'Member deleted successfully. Returns the deleted member object.',
    examples: {
      success: {
        summary: 'Member deleted successfully',
        value: {
          id: 7,
          fullName: 'Ava Jackson-White',
          email: 'ava.jackson-white6@email.com',
          phone: '+1-555-8006',
          gender: 'female',
          dateOfBirth: '1991-07-07',
          addressLine1: '106 Elite Avenue',
          city: 'Downtown',
          state: 'California',
          isActive: true,
          freezMember: false,
          subscriptionId: null,
          branchBranchId: 'b6fdb0ca-3edf-47eb-85c9-ae1ec214e663',
          branch: {
            branchId: 'b6fdb0ca-3edf-47eb-85c9-ae1ec214e663',
            name: 'Fitness First Elite - Downtown',
          },
        },
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
    status: 500,
    description:
      'Internal server error. May occur if cascade deletion fails due to missing foreign key constraints.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }

  @Get(':memberId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get member dashboard data',
    description:
      'Retrieves comprehensive dashboard data including subscriptions, attendance, and goals',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member ID (numeric)',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description:
      'Return member dashboard data with subscriptions, attendance, and goals.',
    type: MemberDashboardDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  getMemberDashboard(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.membersService.getMemberDashboard(memberId);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchMembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':branchId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all members for a branch',
    description:
      'Retrieves all members assigned to a specific branch with their profiles, subscription status, and branch details.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID (UUID format)',
    example: 'dc33cf0d-763b-44af-bdd8-21427357df1b',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all members for the branch.',
    examples: {
      success: {
        summary: 'List of branch members',
        value: [
          {
            id: 1,
            fullName: 'Sophia Johnson-Smith',
            email: 'sophia.johnson-smith0@email.com',
            phone: '+1-555-8000',
            gender: 'female',
            dateOfBirth: '1985-01-01',
            addressLine1: '100 Elite Avenue',
            addressLine2: null,
            city: 'Downtown',
            state: 'California',
            postalCode: '90000',
            avatarUrl: null,
            emergencyContactName: 'Emergency Johnson-Smith',
            emergencyContactPhone: '+1-555-9000',
            isActive: true,
            branch: {
              branchId: 'dc33cf0d-763b-44af-bdd8-21427357df1b',
              name: 'Fitness First Elite - Downtown',
              location: 'Downtown',
            },
            subscription: {
              id: 1,
              isActive: true,
              startDate: '2024-02-29T18:30:00.000Z',
              endDate: '2025-02-28T18:30:00.000Z',
            },
            createdAt: '2025-12-25T08:21:51.773Z',
            updatedAt: '2025-12-25T08:21:52.296Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message:
            'Branch with ID dc33cf0d-763b-44af-bdd8-21427357df1b not found',
          error: 'Not Found',
        },
      },
    },
  })
  findByBranch(@Param('branchId') branchId: string) {
    return this.membersService.findByBranch(branchId);
  }
}
