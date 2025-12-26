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
    description: 'Creates a new member profile with branch assignment and default user account'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Member created successfully.',
    type: Member
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data. Check validation errors.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({
    status: 409,
    description: 'Member with this email already exists.',
  })
  @ApiBody({ 
    type: CreateMemberDto,
    examples: {
      newMember: {
        summary: 'Create a new member',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          address: '123 Main St, City, State',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+0987654321',
            relationship: 'Spouse'
          },
          membershipPlanId: 1,
          branchId: 'branch_123'
        }
      }
    }
  })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get all members',
    description: 'Retrieve all members with optional filtering by branch, status, or search'
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter members by branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by membership status',
    example: 'active',
    enum: ['active', 'inactive']
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search members by name or email',
    example: 'john'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all members.',
    type: [Member]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.membersService.findAll(branchId, status, search);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get a member by ID',
    description: 'Retrieves detailed information about a specific member including membership status and recent activity.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Member ID',
    example: 123
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the member.',
    examples: {
      success: {
        summary: 'Member details',
        value: {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          address: '123 Main St, City, State',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+0987654321',
            relationship: 'Spouse'
          },
          membershipPlanId: 1,
          branchId: 'branch_123',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }
    }
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
          error: 'Not Found'
        }
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update a member',
    description: 'Updates member information such as personal details, contact information, or membership status.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Member ID',
    example: 123
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Member updated successfully.',
    examples: {
      success: {
        summary: 'Member updated successfully',
        value: {
          id: 123,
          firstName: 'John',
          lastName: 'Updated',
          email: 'john.updated@example.com',
          phone: '+1234567891',
          dateOfBirth: '1990-01-01',
          address: '456 New St, City, State',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+0987654321',
            relationship: 'Spouse'
          },
          membershipPlanId: 1,
          branchId: 'branch_123',
          isActive: true,
          updatedAt: '2024-01-02T00:00:00Z'
        }
      }
    }
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
    type: UpdateMemberDto,
    examples: {
      updateContact: {
        summary: 'Update member contact information',
        value: {
          phone: '+1234567891',
          address: '456 New St, City, State'
        }
      }
    }
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
    description: 'Permanently deletes a member account and all associated data. Requires admin privileges. This action cannot be undone.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Member ID',
    example: 123
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Member deleted successfully.',
    examples: {
      success: {
        summary: 'Member deleted successfully',
        value: {
          message: 'Member has been successfully deleted',
          deletedMemberId: 123
        }
      }
    }
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
          error: 'Not Found'
        }
      }
    }
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }

  @Get(':memberId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get member dashboard data',
    description: 'Retrieves comprehensive dashboard data including subscriptions, attendance, and goals'
  })
  @ApiParam({ 
    name: 'memberId', 
    description: 'Member ID (numeric)',
    example: 123
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return member dashboard data with subscriptions, attendance, and goals.',
    type: MemberDashboardDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
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
  @ApiOperation({ summary: 'Get all members for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all members for the branch.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.membersService.findByBranch(branchId);
  }
}
