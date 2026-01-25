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
import { AdminUpdateMemberDto } from './dto/admin-update-member.dto';
import { BranchMemberResponseDto } from './dto/branch-member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { Member } from '../entities/members.entity';
import { MemberDashboardDto } from './dto/member-dashboard.dto';
import { ForbiddenException } from '@nestjs/common';

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
      'Creates a new member profile with branch assignment, membership plan, and optional class selections. A user account is automatically created with default password.',
  })
  @ApiResponse({
    status: 201,
    description: 'Member created successfully with subscription and classes.',
    examples: {
      success: {
        summary: 'Member created with full details',
        value: {
          id: 111,
          fullName: 'Alice Johnson',
          email: 'alice.johnson.test@example.com',
          phone: '+1555123456',
          gender: 'female',
          dateOfBirth: '1992-05-20',
          addressLine1: '456 Oak Avenue',
          addressLine2: null,
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          avatarUrl: null,
          attachmentUrl: null,
          emergencyContactName: 'Bob Johnson',
          emergencyContactPhone: '+1555987654',
          isActive: true,
          freezeMember: false,
          createdAt: '2026-01-11T00:04:35.510Z',
          updatedAt: '2026-01-11T00:04:35.510Z',
          branchBranchId: '3c1f3add-0783-460b-ab77-df3f29aeb7ea',
          is_managed_by_member: true,
          subscription: {
            id: 113,
            plan: {
              id: 1,
              name: 'Elite Basic - Downtown',
              price: 8999,
              durationInDays: 30,
              description: 'Access to premium gym facilities and basic classes'
            },
            classes: [
              {
                classId: 'ab1caf4b-bb4c-489e-aefd-ad6031fc92b1',
                name: 'Elite Morning Yoga',
                description: 'Premium yoga session to start your day with mindfulness and strength',
                timings: 'morning',
                recurrenceType: 'weekly',
                daysOfWeek: [1, 3, 5]
              },
              {
                classId: '7b773efc-b250-4550-9763-8052cac699c0',
                name: 'HIIT Elite Performance',
                description: 'High-intensity interval training for elite athletes',
                timings: 'evening',
                recurrenceType: 'weekly',
                daysOfWeek: [2, 4]
              }
            ],
            startDate: '2026-01-11T05:34:36.139Z',
            endDate: '2026-02-10T05:34:36.139Z',
            isActive: true
          },
          branch: {
            branchId: '3c1f3add-0783-460b-ab77-df3f29aeb7ea',
            name: 'Fitness First Elite - Downtown',
            email: 'downtown@fitnessfirstelite.com',
            phone: '+1-555-0101',
            address: '123 Elite Fitness Drive, Wellness City, WC 90210',
            location: 'Downtown',
            state: 'California',
            mainBranch: true,
            latitude: null,
            longitude: null,
            createdAt: '2026-01-06T06:32:39.084Z',
            updatedAt: '2026-01-06T06:32:39.084Z'
          }
        }
      }
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
    examples: {
      validationError: {
        summary: 'Validation failed',
        value: {
          statusCode: 400,
          message: ['gender must be one of the following values: male, female, other'],
          error: 'Bad Request'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch or Membership Plan not found.',
    examples: {
      branchNotFound: {
        summary: 'Branch not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found'
        }
      },
      planNotFound: {
        summary: 'Plan not found',
        value: {
          statusCode: 404,
          message: 'Membership plan with ID 999 not found',
          error: 'Not Found'
        }
      }
    }
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
          error: 'Conflict'
        }
      }
    }
  })
  @ApiBody({
    type: CreateMemberDto,
    examples: {
      completeMember: {
        summary: 'Create a member with complete information',
        value: {
          fullName: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          phone: '+1555123456',
          gender: 'female',
          dateOfBirth: '1992-05-20',
          addressLine1: '456 Oak Avenue',
          addressLine2: 'Apt 4B',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          avatarUrl: 'https://example.com/avatars/alice.jpg',
          emergencyContactName: 'Bob Johnson',
          emergencyContactPhone: '+1555987654',
          branchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
          membershipPlanId: 1,
          isActive: true,
          attachmentUrl: 'https://example.com/docs/alice-id.pdf',
          freezeMember: false,
          selectedClassIds: [
            '8cd45646-061b-4730-a2a5-1f400226564b',
            '33ec8f27-0708-4808-958f-091301f8aa2c'
          ]
        },
      },
      minimalMember: {
        summary: 'Create a member with minimal required information',
        value: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          branchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
          membershipPlanId: 1,
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
          freezeMember: false,
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
          freezeMember: false,
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
          addressLine1: '456 New St',
          city: 'New York',
          state: 'NY',
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

  @Patch('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Admin update a member',
    description:
      'Admin-only endpoint to update member including sensitive fields like isActive, branchId, membershipPlanId. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully by admin.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
  })
  @ApiBody({
    type: AdminUpdateMemberDto,
    examples: {
      updateStatus: {
        summary: 'Update member active status',
        value: {
          isActive: false,
        },
      },
    },
  })
  adminUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() adminUpdateMemberDto: AdminUpdateMemberDto,
    @CurrentUser() user: User,
  ) {
    // Check if user has admin role
    if (!user.role || !['ADMIN', 'SUPERADMIN'].includes(user.role.name)) {
      throw new ForbiddenException('Admin access required for this operation');
    }
    return this.membersService.adminUpdate(id, adminUpdateMemberDto);
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
          freezeMember: false,
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
      'Retrieves all members assigned to a specific branch with their profiles, ' +
      'subscription status, plan details, enrolled classes, and branch information. ' +
      'This endpoint is typically used by branch administrators to view and manage all members of their branch.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID (UUID format)',
    example: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by membership active status',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search members by name or email (partial match)',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all members for the branch with subscription, plan, classes, and branch details.',
    type: [BranchMemberResponseDto],
    examples: {
      success: {
        summary: 'List of branch members',
        value: [
          {
            id: 101,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            gender: 'male',
            dateOfBirth: '1990-01-15',
            addressLine1: '123 Main Street',
            addressLine2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            avatarUrl: 'https://example.com/avatars/john.jpg',
            attachmentUrl: 'https://example.com/docs/john-id.pdf',
            emergencyContactName: 'Jane Doe',
            emergencyContactPhone: '9876543210',
            isActive: true,
            freezeMember: false,
            createdAt: '2026-01-16T17:13:21.316Z',
            updatedAt: '2026-01-16T17:13:21.316Z',
            branchBranchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
            is_managed_by_member: true,
            subscription: {
              id: 101,
              plan: {
                id: 1,
                name: 'Elite Basic - Downtown',
                price: 8999,
                durationInDays: 30,
                description: 'Access to premium gym facilities and basic classes',
              },
              classes: [
                {
                  classId: '8cd45646-061b-4730-a2a5-1f400226564b',
                  name: 'Elite Morning Yoga',
                  description: 'Premium yoga session to start your day with mindfulness and strength',
                  timings: 'morning',
                  recurrenceType: 'weekly',
                  daysOfWeek: [1, 3, 5],
                },
                {
                  classId: '33ec8f27-0708-4808-958f-091301f8aa2c',
                  name: 'HIIT Elite Performance',
                  description: 'High-intensity interval training for elite athletes',
                  timings: 'evening',
                  recurrenceType: 'weekly',
                  daysOfWeek: [2, 4],
                },
              ],
              startDate: '2026-01-16T17:13:21.315Z',
              endDate: '2026-02-15T17:13:21.315Z',
              isActive: true,
            },
            branch: {
              branchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
              name: 'Fitness First Elite - Downtown',
              email: 'downtown@fitnessfirstelite.com',
              phone: '+1-555-0101',
              address: '123 Elite Fitness Drive, Wellness City, WC 90210',
              location: 'Downtown',
              state: 'California',
              mainBranch: true,
              latitude: null,
              longitude: null,
              createdAt: '2026-01-15T17:28:12.198Z',
              updatedAt: '2026-01-15T17:28:12.198Z',
            },
          },
        ],
      },
      empty: {
        summary: 'No members found',
        value: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid branch ID format.',
    examples: {
      invalidUuid: {
        summary: 'Invalid UUID format',
        value: {
          statusCode: 400,
          message: 'Validation failed (uuid is expected)',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    examples: {
      missingToken: {
        summary: 'No authentication token provided',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
      invalidToken: {
        summary: 'Invalid JWT token',
        value: {
          statusCode: 401,
          message: 'Invalid token',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to access this branch\'s members.',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID dc33cf0d-763b-44af-bdd8-21427357df1b not found',
          error: 'Not Found',
        },
      },
    },
  })
  findByBranch(@Param('branchId') branchId: string) {
    return this.membersService.findByBranch(branchId);
  }
}
