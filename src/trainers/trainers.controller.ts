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
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Trainer } from '../entities/trainers.entity';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new trainer',
    description:
      'Creates a new trainer profile with specialization and contact details',
  })
  @ApiResponse({
    status: 201,
    description: 'Trainer created successfully.',
    type: Trainer,
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
    description: 'Trainer with this email already exists.',
  })
  @ApiBody({
    type: CreateTrainerDto,
    description:
      'Trainer profile data with specialization and branch assignment',
  })
  create(@Body() createDto: CreateTrainerDto) {
    return this.trainersService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all trainers',
    description:
      'Retrieve all trainers with optional filtering by branch or specialization',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter trainers by branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    type: String,
    description: 'Filter trainers by specialization',
    example: 'Yoga',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all trainers.',
    type: [Trainer],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('specialization') specialization?: string,
  ) {
    return this.trainersService.findAll(branchId, specialization);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a trainer by ID',
    description:
      'Retrieves detailed information about a specific trainer including their specializations, availability schedule, assigned classes, and member feedback ratings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the trainer',
    example: 101,
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer details retrieved successfully.',
    type: Trainer,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access trainer information.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Trainer not found - The specified trainer ID does not exist or has been deactivated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving trainer details.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a trainer',
    description:
      'Updates trainer information including contact details, specializations, availability schedule, and branch assignments. Only admins and the trainer themselves can update profile information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the trainer to update',
    example: 101,
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer updated successfully.',
    type: Trainer,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data - Check validation errors for email format, phone number, or specialization details.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to update trainer information.',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer not found - The specified trainer ID does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Trainer with this email already exists - Email address must be unique across all trainers.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while updating trainer information.',
  })
  @ApiBody({
    type: UpdateTrainerDto,
    description: 'Updated trainer profile data with new information',
    examples: {
      contactUpdate: {
        summary: 'Update contact information',
        value: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0123',
          specializations: ['Yoga', 'Pilates', 'Meditation'],
          experience: 8,
          bio: 'Certified yoga instructor with 8+ years of experience in Hatha and Vinyasa yoga.',
          hourlyRate: 75.0,
        },
      },
      availabilityUpdate: {
        summary: 'Update availability schedule',
        value: {
          availabilitySchedule: {
            monday: ['09:00-12:00', '14:00-18:00'],
            tuesday: ['09:00-12:00', '14:00-18:00'],
            wednesday: ['09:00-12:00'],
            thursday: ['14:00-18:00'],
            friday: ['09:00-12:00', '14:00-18:00'],
            saturday: ['10:00-16:00'],
            sunday: [],
          },
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTrainerDto,
  ) {
    return this.trainersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a trainer',
    description:
      'Permanently removes a trainer from the system. This action cannot be undone and will also remove all associated class assignments, member assignments, and attendance records. Only super admins can delete trainers.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the trainer to delete',
    example: 101,
    schema: { type: 'integer', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description:
      'Trainer deleted successfully - All associated records have been removed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to delete trainer. Only super admins can perform this action.',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer not found - The specified trainer ID does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete trainer - Trainer has active classes or member assignments. Please reassign or cancel all active relationships first.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while deleting trainer information.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trainersService.remove(id);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchTrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get(':branchId/trainers')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all trainers for a branch',
    description:
      'Retrieves all trainers assigned to a specific branch, including their specializations, availability, and current class schedules. Useful for branch managers to view their trainer team.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Unique identifier for the branch',
    example: 'branch-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Trainers retrieved successfully for the branch.',
    type: [Trainer],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access branch trainers.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Branch not found - The specified branch ID does not exist or you do not have access to it.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving branch trainers.',
  })
  findByBranch(@Param('branchId') branchId: string) {
    return this.trainersService.findByBranch(branchId);
  }
}
