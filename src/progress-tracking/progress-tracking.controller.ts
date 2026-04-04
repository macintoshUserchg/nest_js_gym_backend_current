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
  DefaultValuePipe,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { paginate } from '../common/dto/pagination.dto';
import { ProgressTrackingService } from './progress-tracking.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('progress-tracking')
@Controller('progress-tracking')
export class ProgressTrackingController {
  constructor(
    private readonly progressTrackingService: ProgressTrackingService,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new progress tracking record',
    description:
      'Records detailed progress tracking data for gym members including performance metrics, milestone achievements, workout completion rates, and fitness goal progress. This endpoint allows trainers to monitor member development and track fitness journey milestones.',
  })
  @ApiResponse({
    status: 201,
    description: 'Progress tracking record created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'prog_123456789' },
        memberId: { type: 'number', example: 123 },
        goalType: {
          type: 'string',
          example: 'weight_loss',
          enum: [
            'weight_loss',
            'muscle_gain',
            'endurance',
            'strength',
            'flexibility',
            'general_fitness',
          ],
        },
        currentValue: { type: 'number', example: 75.5 },
        targetValue: { type: 'number', example: 70.0 },
        unit: {
          type: 'string',
          example: 'kg',
          enum: ['kg', 'lbs', 'reps', 'seconds', 'minutes', 'percentage'],
        },
        progressPercentage: { type: 'number', example: 65.5 },
        milestone: { type: 'string', example: 'Lost 5kg milestone reached' },
        achievements: {
          type: 'array',
          items: { type: 'string' },
          example: ['5kg_weight_loss', '30_day_streak', 'workout_consistency'],
        },
        notes: {
          type: 'string',
          example:
            'Member showing excellent progress, maintaining workout consistency',
        },
        recordedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        createdBy: { type: 'number', example: 45 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid progress tracking data provided or target value not achievable.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to create progress records.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found or does not exist.',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate progress record for the same goal and date.',
  })
  @ApiBody({
    type: CreateProgressDto,
    description:
      'Progress tracking data including goals, achievements, and performance metrics',
    examples: {
      weight_loss_goal: {
        summary: 'Weight loss progress tracking',
        value: {
          memberId: 123,
          goalType: 'weight_loss',
          currentValue: 75.5,
          targetValue: 70.0,
          unit: 'kg',
          progressPercentage: 65.5,
          milestone: 'Lost 5kg milestone reached',
          achievements: ['5kg_weight_loss', '30_day_streak'],
          notes:
            'Member showing excellent progress, maintaining workout consistency',
          recordedAt: '2024-01-15T10:30:00.000Z',
        },
      },
      strength_progress: {
        summary: 'Strength training progress',
        value: {
          memberId: 456,
          goalType: 'strength',
          currentValue: 80,
          targetValue: 100,
          unit: 'kg',
          progressPercentage: 80.0,
          milestone: 'Bench press 80kg milestone',
          achievements: ['bench_80kg', 'progressive_overload'],
          notes: 'Steady strength gains, form improving significantly',
          recordedAt: '2024-01-15T14:20:00.000Z',
        },
      },
    },
  })
  create(
    @Body() createProgressDto: CreateProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.create(createProgressDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all progress tracking records',
    description:
      'Retrieves comprehensive list of progress tracking records across all members. Supports filtering by goal type, member, date range, and achievement status. Provides analytics data for business intelligence and member performance insights.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'memberId',
    required: false,
    type: Number,
    description: 'Filter by specific member ID',
    example: 123,
  })
  @ApiQuery({
    name: 'goalType',
    required: false,
    type: String,
    description: 'Filter by goal type',
    example: 'weight_loss',
    enum: [
      'weight_loss',
      'muscle_gain',
      'endurance',
      'strength',
      'flexibility',
      'general_fitness',
    ],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter records from this date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter records up to this date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'achievement',
    required: false,
    type: String,
    description: 'Filter by specific achievement',
    example: '5kg_weight_loss',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
    example: 'recordedAt',
    enum: ['recordedAt', 'progressPercentage', 'currentValue', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved progress tracking records',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prog_123456789' },
              memberId: { type: 'number', example: 123 },
              goalType: { type: 'string', example: 'weight_loss' },
              currentValue: { type: 'number', example: 75.5 },
              targetValue: { type: 'number', example: 70.0 },
              progressPercentage: { type: 'number', example: 65.5 },
              milestone: {
                type: 'string',
                example: 'Lost 5kg milestone reached',
              },
              achievements: {
                type: 'array',
                items: { type: 'string' },
                example: ['5kg_weight_loss', '30_day_streak'],
              },
              notes: {
                type: 'string',
                example: 'Member showing excellent progress',
              },
              recordedAt: { type: 'string', format: 'date-time' },
              member: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 8 },
            totalRecords: { type: 'number', example: 156 },
            recordsPerPage: { type: 'number', example: 20 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        analytics: {
          type: 'object',
          properties: {
            totalActiveGoals: { type: 'number', example: 89 },
            averageProgress: { type: 'number', example: 67.3 },
            topGoalType: { type: 'string', example: 'weight_loss' },
            milestonesThisMonth: { type: 'number', example: 23 },
            topPerformers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  memberId: { type: 'number', example: 123 },
                  progressPercentage: { type: 'number', example: 95.2 },
                  goalType: { type: 'string', example: 'strength' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters provided.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view progress tracking records.',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.progressTrackingService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a progress tracking record by ID',
    description:
      'Retrieves detailed information about a specific progress tracking record including complete member information, achievement history, and performance analytics. Provides comprehensive view of member fitness journey and goal progress.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the progress tracking record',
    type: 'string',
    example: 'prog_123456789',
    schema: { type: 'string', pattern: '^prog_[0-9]+$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved progress tracking record',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'prog_123456789' },
        memberId: { type: 'number', example: 123 },
        goalType: {
          type: 'string',
          example: 'weight_loss',
          enum: [
            'weight_loss',
            'muscle_gain',
            'endurance',
            'strength',
            'flexibility',
            'general_fitness',
          ],
        },
        currentValue: { type: 'number', example: 75.5 },
        targetValue: { type: 'number', example: 70.0 },
        initialValue: { type: 'number', example: 82.3 },
        unit: {
          type: 'string',
          example: 'kg',
          enum: ['kg', 'lbs', 'reps', 'seconds', 'minutes', 'percentage'],
        },
        progressPercentage: { type: 'number', example: 65.5 },
        milestone: { type: 'string', example: 'Lost 5kg milestone reached' },
        achievements: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '5kg_weight_loss',
            '30_day_streak',
            'workout_consistency',
            'nutrition_goals',
          ],
        },
        streakCount: { type: 'number', example: 15 },
        lastUpdateDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        estimatedCompletionDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-15T00:00:00.000Z',
        },
        notes: {
          type: 'string',
          example:
            'Member showing excellent progress, maintaining workout consistency and improved nutrition habits.',
        },
        recordedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        createdBy: { type: 'number', example: 45 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T14:20:00.000Z',
        },
        member: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1-555-0123' },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-05-15',
            },
            gender: {
              type: 'string',
              example: 'male',
              enum: ['male', 'female', 'other'],
            },
            membershipType: { type: 'string', example: 'premium' },
          },
        },
        createdByUser: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 45 },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            role: {
              type: 'string',
              example: 'trainer',
              enum: ['admin', 'trainer', 'staff'],
            },
          },
        },
        progressHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date-time' },
              value: { type: 'number' },
              milestone: { type: 'string' },
              notes: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid progress tracking record ID format.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view this progress record.',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found or does not exist.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.progressTrackingService.findOne(id.toString());
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a progress tracking record',
    description:
      'Updates an existing progress tracking record with new values, achievements, or milestone information. Automatically recalculates progress percentage and updates achievement status. Only the creator or authorized personnel can modify records.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the progress tracking record to update',
    type: 'string',
    example: 'prog_123456789',
    schema: { type: 'string', pattern: '^prog_[0-9]+$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress tracking record updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'prog_123456789' },
        memberId: { type: 'number', example: 123 },
        goalType: { type: 'string', example: 'weight_loss' },
        currentValue: { type: 'number', example: 73.2 },
        targetValue: { type: 'number', example: 70.0 },
        progressPercentage: { type: 'number', example: 74.1 },
        milestone: { type: 'string', example: 'Lost 7kg milestone reached' },
        achievements: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '5kg_weight_loss',
            '7kg_weight_loss',
            '30_day_streak',
            'nutrition_goals',
          ],
        },
        streakCount: { type: 'number', example: 22 },
        notes: {
          type: 'string',
          example: 'Updated progress - member exceeded expectations this week',
        },
        recordedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-20T09:15:00.000Z',
        },
        message: {
          type: 'string',
          example: 'Progress tracking record updated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data provided or validation failed.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to update this progress record.',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found or does not exist.',
  })
  @ApiBody({
    type: UpdateProgressDto,
    description:
      'Updated progress tracking data - only include fields that need to be updated',
    examples: {
      progress_update: {
        summary: 'Update current progress value',
        value: {
          currentValue: 73.2,
          notes: 'Member lost additional 2.3kg this week, excellent progress!',
          milestone: 'Lost 7kg milestone reached',
        },
      },
      add_achievement: {
        summary: 'Add new achievement',
        value: {
          achievements: ['nutrition_goals', 'consistent_workouts'],
          notes:
            'Member has been very consistent with nutrition and workout schedule',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.update(
      id.toString(),
      updateProgressDto,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a progress tracking record',
    description:
      'Permanently removes a progress tracking record from the system. This action cannot be undone and will affect member goal tracking and analytics. Only admins, the record creator, or users with appropriate permissions can delete progress records.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the progress tracking record to delete',
    type: 'string',
    example: 'prog_123456789',
    schema: { type: 'string', pattern: '^prog_[0-9]+$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress tracking record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Progress tracking record deleted successfully',
        },
        deletedRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prog_123456789' },
            memberId: { type: 'number', example: 123 },
            goalType: { type: 'string', example: 'weight_loss' },
            recordedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T09:15:00.000Z',
            },
            deletedBy: { type: 'number', example: 45 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid progress tracking record ID format.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to delete this progress record.',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found or does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete record - it has associated dependent analytics data.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.remove(id.toString(), user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get progress tracking records for a specific member',
    description:
      'Retrieves all progress tracking records for a specific gym member, including goal progress, achievements, and performance analytics. Provides comprehensive view of member fitness journey and goal completion status.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Unique identifier of the member',
    type: 'number',
    example: 123,
    schema: { type: 'number', minimum: 1 },
  })
  @ApiQuery({
    name: 'goalType',
    required: false,
    type: String,
    description: 'Filter by specific goal type',
    example: 'weight_loss',
    enum: [
      'weight_loss',
      'muscle_gain',
      'endurance',
      'strength',
      'flexibility',
      'general_fitness',
    ],
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Show only active goals (default: false)',
    example: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return',
    example: 10,
  })
  @ApiQuery({
    name: 'includeHistory',
    required: false,
    type: Boolean,
    description: 'Include progress history data',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member progress tracking records',
    schema: {
      type: 'object',
      properties: {
        memberId: { type: 'number', example: 123 },
        memberInfo: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            membershipType: { type: 'string', example: 'premium' },
            joinDate: { type: 'string', format: 'date', example: '2023-06-15' },
          },
        },
        progressRecords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prog_123456789' },
              goalType: { type: 'string', example: 'weight_loss' },
              currentValue: { type: 'number', example: 75.5 },
              targetValue: { type: 'number', example: 70.0 },
              progressPercentage: { type: 'number', example: 65.5 },
              milestone: {
                type: 'string',
                example: 'Lost 5kg milestone reached',
              },
              achievements: {
                type: 'array',
                items: { type: 'string' },
                example: ['5kg_weight_loss', '30_day_streak'],
              },
              isActive: { type: 'boolean', example: true },
              recordedAt: { type: 'string', format: 'date-time' },
              createdBy: { type: 'number', example: 45 },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            totalGoals: { type: 'number', example: 5 },
            activeGoals: { type: 'number', example: 3 },
            completedGoals: { type: 'number', example: 2 },
            averageProgress: { type: 'number', example: 67.3 },
            totalAchievements: { type: 'number', example: 12 },
            topPerformingGoal: { type: 'string', example: 'strength' },
            longestStreak: { type: 'number', example: 45 },
            joinToNowDays: { type: 'number', example: 214 },
          },
        },
        goalBreakdown: {
          type: 'object',
          description: 'Progress breakdown by goal type',
          example: {
            weight_loss: { active: 1, completed: 1, avgProgress: 75.2 },
            strength: { active: 1, completed: 0, avgProgress: 45.8 },
            endurance: { active: 1, completed: 1, avgProgress: 82.1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid member ID or query parameters.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view member progress records.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found or does not exist.',
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.progressTrackingService.findByMember(memberId);
  }

  @Get('user/my-progress-records')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get progress tracking records created by the current user',
    description:
      'Retrieves all progress tracking records that were created by the currently authenticated user (trainer/staff). Useful for trainers to review their own progress entries, monitor their assigned members, and track their coaching effectiveness.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Records per page (max 50)',
    example: 25,
  })
  @ApiQuery({
    name: 'goalType',
    required: false,
    type: String,
    description: 'Filter by specific goal type',
    example: 'weight_loss',
  })
  @ApiQuery({
    name: 'memberId',
    required: false,
    type: Number,
    description: 'Filter by specific member ID',
    example: 123,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Show only active goals',
    example: true,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter records from this date',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter records up to this date',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved progress tracking records created by current user',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prog_123456789' },
              memberId: { type: 'number', example: 123 },
              member: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  membershipType: { type: 'string', example: 'premium' },
                },
              },
              goalType: { type: 'string', example: 'weight_loss' },
              currentValue: { type: 'number', example: 75.5 },
              targetValue: { type: 'number', example: 70.0 },
              progressPercentage: { type: 'number', example: 65.5 },
              milestone: {
                type: 'string',
                example: 'Lost 5kg milestone reached',
              },
              achievements: {
                type: 'array',
                items: { type: 'string' },
                example: ['5kg_weight_loss', '30_day_streak'],
              },
              isActive: { type: 'boolean', example: true },
              recordedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 4 },
            totalRecords: { type: 'number', example: 89 },
            recordsPerPage: { type: 'number', example: 25 },
          },
        },
        coachingStats: {
          type: 'object',
          properties: {
            totalRecordsCreated: { type: 'number', example: 89 },
            membersTracked: { type: 'number', example: 31 },
            activeGoalsManaged: { type: 'number', example: 47 },
            goalsCompleted: { type: 'number', example: 18 },
            averageMemberProgress: { type: 'number', example: 68.5 },
            topGoalTypeManaged: { type: 'string', example: 'weight_loss' },
            recordsThisMonth: { type: 'number', example: 15 },
            lastRecordDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view created progress records.',
  })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.progressTrackingService.findByUser(user.userId);
  }
}
