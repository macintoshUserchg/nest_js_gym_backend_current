import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Class } from '../entities/classes.entity';
import { log } from 'console';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new class',
    description: 'Creates a new class with scheduling and recurrence rules',
  })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully.',
    type: Class,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  @ApiResponse({
    status: 409,
    description: 'Class with this name already exists in this branch.',
  })
  @ApiBody({
    type: CreateClassDto,
    description: 'Class data with recurrence rules and timing options',
  })
  create(@Body() createDto: CreateClassDto) {
    return this.classesService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all classes',
    description:
      'Retrieve all classes with optional filtering by branch, timing, or day',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all classes.',
    type: [Class],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a class by ID',
    description:
      'Retrieves detailed information about a specific fitness class including schedule, capacity, instructor details, and current enrollment status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the class',
    example: 'cls-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Class details retrieved successfully.',
    type: Class,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access class information.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Class not found - The specified class ID does not exist or has been removed.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving class details.',
  })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a class',
    description:
      'Updates class information including schedule, capacity, instructor assignment, and recurrence rules. Only admin and branch managers can update class details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the class to update',
    example: 'cls-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully.',
    type: Class,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data - Check validation errors for class capacity, timing conflicts, or instructor availability.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to update class information.',
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found - The specified class ID does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Schedule conflict - Class timing conflicts with existing classes or instructor availability.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while updating class information.',
  })
  @ApiBody({
    type: UpdateClassDto,
    description:
      'Updated class data with new schedule, capacity, or instructor information',
    examples: {
      scheduleUpdate: {
        summary: 'Update class schedule',
        value: {
          name: 'Advanced Yoga Flow',
          capacity: 25,
          startTime: '18:00',
          endTime: '19:00',
          instructorId: 101,
          isActive: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
          branchId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      capacityUpdate: {
        summary: 'Update class capacity',
        value: {
          capacity: 30,
          waitlistEnabled: true,
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateClassDto) {
    return this.classesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a class',
    description:
      'Permanently removes a fitness class from the system. This action cannot be undone and will also remove all associated enrollments and attendance records. Only super admins can delete classes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the class to delete',
    example: 'cls-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description:
      'Class deleted successfully - All associated records have been removed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to delete class. Only super admins can perform this action.',
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found - The specified class ID does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete class - Class has active enrollments or scheduled sessions. Please cancel all enrollments first.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while deleting class information.',
  })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get(':branchId/classes')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all classes for a branch',
    description:
      'Retrieves all fitness classes available at a specific branch, including class schedules, capacity, and instructor information. Useful for branch managers to view their class offerings.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Unique identifier for the branch',
    example: 'branch-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully for the branch.',
    type: [Class],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access branch classes.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Branch not found - The specified branch ID does not exist or you do not have access to it.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving branch classes.',
  })
  findByBranch(@Param('branchId') branchId: string) {
    return this.classesService.findByBranch(branchId);
  }
}

@ApiTags('gyms')
@Controller('gyms')
export class GymClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get(':gymId/classes')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all classes for a gym',
    description:
      'Retrieves all classes across all branches for a specific gym. This is a convenience endpoint that eliminates the need to first fetch branches and then fetch classes for each branch. Useful for gym owners and super admins to view comprehensive class offerings.',
  })
  @ApiParam({
    name: 'gymId',
    description: 'Unique identifier for the gym (UUID format)',
    example: 'gym-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns all classes for the gym, grouped by branch. Each class includes its branch information and current enrollment status.',
    type: [Class],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access gym classes.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Gym not found - The specified gym ID does not exist or you do not have access to it.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving gym classes.',
  })
  findByGym(@Param('gymId') gymId: string) {
    return this.classesService.findByGym(gymId);
  }
}
