import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Assign a member to a trainer',
    description:
      'Creates a new assignment relationship between a member and trainer. This allows members to have personalized training sessions and progress tracking. Only admins and branch managers can create assignments.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Assignment created successfully - Member is now assigned to the trainer.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request - Check if member is already assigned to this trainer or if trainer has reached maximum capacity.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to create assignments.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Member or trainer not found - Check that both member and trainer IDs exist and are active.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Assignment already exists - Member is already assigned to this trainer or trainer has reached maximum capacity.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while creating assignment.',
  })
  @ApiBody({
    type: CreateAssignmentDto,
    description: 'Member-trainer assignment data',
    examples: {
      newAssignment: {
        summary: 'Assign member to trainer',
        value: {
          memberId: 1001,
          trainerId: 101,
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          sessionsPerWeek: 3,
          preferredTimes: ['09:00-10:00', '14:00-15:00', '18:00-19:00'],
          goals: ['Weight Loss', 'Muscle Building'],
          notes:
            'Focus on strength training and cardio combination. Member has knee injury, avoid high-impact exercises.',
        },
      },
      trialAssignment: {
        summary: 'Create trial assignment',
        value: {
          memberId: 1002,
          trainerId: 102,
          startDate: '2025-01-15',
          endDate: '2025-01-31',
          sessionsPerWeek: 2,
          isTrial: true,
          goals: ['Fitness Assessment', 'Program Design'],
        },
      },
    },
  })
  create(@Body() createDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all assignments',
    description:
      'Retrieves all member-trainer assignments across the system. Includes assignment details, member information, trainer details, and session schedules. Useful for administrators to monitor training relationships.',
  })
  @ApiResponse({
    status: 200,
    description: 'All assignments retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access assignment data.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving assignments.',
  })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get an assignment by ID',
    description:
      'Retrieves detailed information about a specific member-trainer assignment including session history, progress tracking, and schedule details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the assignment',
    example: 'assign-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment details retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access assignment information.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Assignment not found - The specified assignment ID does not exist.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving assignment details.',
  })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete an assignment',
    description:
      'Permanently removes a member-trainer assignment relationship. This action cannot be undone and will remove all associated session records and progress tracking data. Only admins and branch managers can delete assignments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the assignment to delete',
    example: 'assign-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description:
      'Assignment deleted successfully - Member-trainer relationship has been removed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to delete assignments.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Assignment not found - The specified assignment ID does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete assignment - Assignment has active sessions or payment records. Please cancel all scheduled sessions first.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while deleting assignment.',
  })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberAssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':memberId/assignments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all trainer assignments for a member',
    description:
      'Retrieves all trainer assignments for a specific member, including active assignments, completed sessions, and upcoming scheduled training sessions. Members can only view their own assignments.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Unique identifier for the member',
    example: 1001,
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Member assignments retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access member assignments.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Member not found - The specified member ID does not exist or you do not have access to view their assignments.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving member assignments.',
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.assignmentsService.findByMember(memberId);
  }
}

@ApiTags('trainers')
@Controller('trainers')
export class TrainerAssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':trainerId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all members assigned to a trainer',
    description:
      'Retrieves all member assignments for a specific trainer, including active members, session schedules, progress tracking, and performance metrics. Trainers can only view their own assignments.',
  })
  @ApiParam({
    name: 'trainerId',
    description: 'Unique identifier for the trainer',
    example: 101,
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer assignments retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access trainer assignments.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Trainer not found - The specified trainer ID does not exist or you do not have access to view their assignments.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving trainer assignments.',
  })
  findByTrainer(@Param('trainerId', ParseIntPipe) trainerId: number) {
    return this.assignmentsService.findByTrainer(trainerId);
  }
}
