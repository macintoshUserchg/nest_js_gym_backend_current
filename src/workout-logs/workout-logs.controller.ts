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
import { WorkoutLogsService } from './workout-logs.service';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('workout-logs')
@Controller('workout-logs')
export class WorkoutLogsController {
  constructor(private readonly workoutLogsService: WorkoutLogsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new workout log',
    description:
      'Records detailed workout session data including exercises performed, sets, reps, weights, duration, intensity levels, and member performance metrics. This endpoint allows trainers and members to track workout progress and maintain detailed training records.',
  })
  @ApiResponse({
    status: 201,
    description: 'Workout log created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        workoutDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T18:30:00.000Z',
        },
        workoutType: {
          type: 'string',
          example: 'strength_training',
          enum: [
            'strength_training',
            'cardio',
            'hiit',
            'flexibility',
            'sports_specific',
            'rehabilitation',
          ],
        },
        duration: { type: 'number', example: 75 }, // minutes
        totalCalories: { type: 'number', example: 450 },
        averageHeartRate: { type: 'number', example: 145 },
        maxHeartRate: { type: 'number', example: 175 },
        intensityLevel: {
          type: 'string',
          example: 'moderate',
          enum: ['low', 'moderate', 'high', 'very_high'],
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              exerciseId: { type: 'number', example: 1 },
              exerciseName: { type: 'string', example: 'Bench Press' },
              muscleGroups: {
                type: 'array',
                items: { type: 'string' },
                example: ['chest', 'shoulders', 'triceps'],
              },
              sets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    setNumber: { type: 'number', example: 1 },
                    reps: { type: 'number', example: 12 },
                    weight: { type: 'number', example: 80 },
                    weightUnit: {
                      type: 'string',
                      example: 'kg',
                      enum: ['kg', 'lbs'],
                    },
                    duration: { type: 'number', example: 45 }, // seconds
                    restTime: { type: 'number', example: 90 }, // seconds
                    rpe: { type: 'number', example: 8 }, // Rate of Perceived Exertion 1-10
                    completed: { type: 'boolean', example: true },
                  },
                },
              },
              notes: {
                type: 'string',
                example: 'Felt strong today, form was good',
              },
            },
          },
        },
        cardioData: {
          type: 'object',
          properties: {
            distance: { type: 'number', example: 5.2 },
            distanceUnit: {
              type: 'string',
              example: 'km',
              enum: ['km', 'miles'],
            },
            averagePace: { type: 'number', example: 5.5 }, // min/km
            elevationGain: { type: 'number', example: 150 },
          },
        },
        memberFeedback: {
          type: 'object',
          properties: {
            energyLevel: {
              type: 'number',
              example: 8,
              minimum: 1,
              maximum: 10,
            },
            workoutEnjoyment: {
              type: 'number',
              example: 9,
              minimum: 1,
              maximum: 10,
            },
            difficultyRating: {
              type: 'number',
              example: 7,
              minimum: 1,
              maximum: 10,
            },
            comments: {
              type: 'string',
              example:
                'Great workout today! Felt very energized and pushed myself harder than usual.',
            },
          },
        },
        trainerNotes: {
          type: 'string',
          example:
            'Member showed excellent form and progression. Ready to increase weight next session.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['push_day', 'upper_body', 'progressive_overload'],
        },
        createdBy: { type: 'number', example: 45 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T20:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid workout log data provided or validation failed.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to create workout logs.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found or does not exist.',
  })
  @ApiBody({
    type: CreateWorkoutLogDto,
    description:
      'Workout session data including exercises, sets, performance metrics, and feedback',
    examples: {
      strength_training: {
        summary: 'Strength training session with multiple exercises',
        value: {
          memberId: 123,
          workoutDate: '2024-01-15T18:30:00.000Z',
          workoutType: 'strength_training',
          duration: 75,
          totalCalories: 450,
          intensityLevel: 'moderate',
          exercises: [
            {
              exerciseId: 1,
              exerciseName: 'Bench Press',
              muscleGroups: ['chest', 'shoulders', 'triceps'],
              sets: [
                {
                  setNumber: 1,
                  reps: 12,
                  weight: 80,
                  weightUnit: 'kg',
                  duration: 45,
                  restTime: 90,
                  rpe: 7,
                  completed: true,
                },
                {
                  setNumber: 2,
                  reps: 10,
                  weight: 85,
                  weightUnit: 'kg',
                  duration: 42,
                  restTime: 120,
                  rpe: 8,
                  completed: true,
                },
              ],
              notes: 'Felt strong today, form was good',
            },
          ],
          memberFeedback: {
            energyLevel: 8,
            workoutEnjoyment: 9,
            difficultyRating: 7,
            comments: 'Great workout today! Felt very energized.',
          },
          trainerNotes: 'Member showed excellent form and progression.',
          tags: ['push_day', 'upper_body', 'progressive_overload'],
        },
      },
      cardio_session: {
        summary: 'Cardio workout with distance and pace tracking',
        value: {
          memberId: 456,
          workoutDate: '2024-01-15T07:00:00.000Z',
          workoutType: 'cardio',
          duration: 45,
          totalCalories: 380,
          averageHeartRate: 155,
          maxHeartRate: 175,
          intensityLevel: 'high',
          exercises: [
            {
              exerciseId: 3,
              exerciseName: 'Treadmill Run',
              muscleGroups: ['legs', 'cardiovascular'],
              sets: [
                {
                  setNumber: 1,
                  reps: 1,
                  weight: 0,
                  duration: 2700, // 45 minutes in seconds
                  rpe: 8,
                  completed: true,
                },
              ],
            },
          ],
          cardioData: {
            distance: 5.2,
            distanceUnit: 'km',
            averagePace: 5.5,
            elevationGain: 0,
          },
          memberFeedback: {
            energyLevel: 7,
            workoutEnjoyment: 8,
            difficultyRating: 6,
            comments: 'Good run, felt comfortable at this pace.',
          },
          tags: ['morning_cardio', 'endurance'],
        },
      },
    },
  })
  create(
    @Body() createWorkoutLogDto: CreateWorkoutLogDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutLogsService.create(createWorkoutLogDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all workout logs',
    description:
      'Retrieves comprehensive list of workout logs across all members with advanced filtering, analytics, and performance insights. Supports filtering by member, date range, workout type, intensity, muscle groups, and performance metrics. Provides training analytics and progress trends.',
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
    description: 'Number of logs per page (default: 20, max: 100)',
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
    name: 'workoutType',
    required: false,
    type: String,
    description: 'Filter by workout type',
    example: 'strength_training',
    enum: [
      'strength_training',
      'cardio',
      'hiit',
      'flexibility',
      'sports_specific',
      'rehabilitation',
    ],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter logs from this date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter logs up to this date (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'intensityLevel',
    required: false,
    type: String,
    description: 'Filter by intensity level',
    example: 'high',
    enum: ['low', 'moderate', 'high', 'very_high'],
  })
  @ApiQuery({
    name: 'muscleGroup',
    required: false,
    type: String,
    description: 'Filter by target muscle group',
    example: 'chest',
  })
  @ApiQuery({
    name: 'minDuration',
    required: false,
    type: Number,
    description: 'Minimum workout duration in minutes',
    example: 30,
  })
  @ApiQuery({
    name: 'maxDuration',
    required: false,
    type: Number,
    description: 'Maximum workout duration in minutes',
    example: 120,
  })
  @ApiQuery({
    name: 'trainerId',
    required: false,
    type: Number,
    description: 'Filter by trainer who created the log',
    example: 45,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
    example: 'workoutDate',
    enum: [
      'workoutDate',
      'duration',
      'totalCalories',
      'createdAt',
      'intensityLevel',
    ],
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
    description: 'Successfully retrieved workout logs',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12345 },
              memberId: { type: 'number', example: 123 },
              workoutDate: { type: 'string', format: 'date-time' },
              workoutType: { type: 'string', example: 'strength_training' },
              duration: { type: 'number', example: 75 },
              totalCalories: { type: 'number', example: 450 },
              intensityLevel: { type: 'string', example: 'moderate' },
              totalExercises: { type: 'number', example: 6 },
              totalSets: { type: 'number', example: 18 },
              member: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                },
              },
              createdByUser: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 45 },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Smith' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 15 },
            totalRecords: { type: 'number', example: 298 },
            recordsPerPage: { type: 'number', example: 20 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        analytics: {
          type: 'object',
          properties: {
            totalWorkouts: { type: 'number', example: 298 },
            totalDuration: { type: 'number', example: 22350 }, // minutes
            averageDuration: { type: 'number', example: 75 },
            totalCaloriesBurned: { type: 'number', example: 134100 },
            averageCaloriesPerWorkout: { type: 'number', example: 450 },
            mostPopularWorkoutType: {
              type: 'string',
              example: 'strength_training',
            },
            mostTargetedMuscleGroup: { type: 'string', example: 'chest' },
            workoutsThisWeek: { type: 'number', example: 23 },
            averageIntensity: { type: 'string', example: 'moderate' },
            topPerformers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  memberId: { type: 'number', example: 123 },
                  workoutCount: { type: 'number', example: 45 },
                  averageDuration: { type: 'number', example: 82 },
                  consistencyScore: { type: 'number', example: 92.5 },
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
    description: 'Forbidden - Insufficient permissions to view workout logs.',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.workoutLogsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a workout log by ID',
    description:
      'Retrieves detailed information about a specific workout log including complete exercise data, set-by-set performance, member feedback, trainer notes, and analytics. Provides comprehensive view of the training session and progress tracking.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout log',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workout log details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        workoutDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T18:30:00.000Z',
        },
        workoutType: {
          type: 'string',
          example: 'strength_training',
          enum: [
            'strength_training',
            'cardio',
            'hiit',
            'flexibility',
            'sports_specific',
            'rehabilitation',
          ],
        },
        duration: { type: 'number', example: 75 },
        totalCalories: { type: 'number', example: 450 },
        averageHeartRate: { type: 'number', example: 145 },
        maxHeartRate: { type: 'number', example: 175 },
        restingHeartRate: { type: 'number', example: 65 },
        intensityLevel: {
          type: 'string',
          example: 'moderate',
          enum: ['low', 'moderate', 'high', 'very_high'],
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              exerciseId: { type: 'number', example: 1 },
              exerciseName: { type: 'string', example: 'Bench Press' },
              category: {
                type: 'string',
                example: 'strength',
                enum: [
                  'strength',
                  'cardio',
                  'flexibility',
                  'balance',
                  'coordination',
                ],
              },
              muscleGroups: {
                type: 'array',
                items: { type: 'string' },
                example: ['chest', 'shoulders', 'triceps'],
              },
              equipment: {
                type: 'array',
                items: { type: 'string' },
                example: ['barbell', 'bench', 'weight_plates'],
              },
              sets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    setNumber: { type: 'number', example: 1 },
                    reps: { type: 'number', example: 12 },
                    weight: { type: 'number', example: 80 },
                    weightUnit: {
                      type: 'string',
                      example: 'kg',
                      enum: ['kg', 'lbs'],
                    },
                    duration: { type: 'number', example: 45 },
                    restTime: { type: 'number', example: 90 },
                    rpe: {
                      type: 'number',
                      example: 7,
                      minimum: 1,
                      maximum: 10,
                    },
                    rpm: { type: 'number', example: 120 }, // Reps per minute
                    completed: { type: 'boolean', example: true },
                    notes: {
                      type: 'string',
                      example: 'Felt strong on this set',
                    },
                  },
                },
              },
              totalVolume: { type: 'number', example: 2440 }, // Total weight * reps
              notes: {
                type: 'string',
                example: 'Felt strong today, form was good',
              },
              exerciseOrder: { type: 'number', example: 1 },
            },
          },
        },
        cardioData: {
          type: 'object',
          properties: {
            distance: { type: 'number', example: 5.2 },
            distanceUnit: {
              type: 'string',
              example: 'km',
              enum: ['km', 'miles'],
            },
            averagePace: { type: 'number', example: 5.5 },
            maxPace: { type: 'number', example: 4.8 },
            elevationGain: { type: 'number', example: 150 },
            averageIncline: { type: 'number', example: 2.5 },
            avgSpeed: { type: 'number', example: 10.9 },
            maxSpeed: { type: 'number', example: 12.5 },
          },
        },
        memberFeedback: {
          type: 'object',
          properties: {
            energyLevel: {
              type: 'number',
              example: 8,
              minimum: 1,
              maximum: 10,
            },
            workoutEnjoyment: {
              type: 'number',
              example: 9,
              minimum: 1,
              maximum: 10,
            },
            difficultyRating: {
              type: 'number',
              example: 7,
              minimum: 1,
              maximum: 10,
            },
            motivationLevel: {
              type: 'number',
              example: 8,
              minimum: 1,
              maximum: 10,
            },
            painOrDiscomfort: {
              type: 'number',
              example: 2,
              minimum: 1,
              maximum: 10,
            },
            recoveryFeeling: {
              type: 'number',
              example: 7,
              minimum: 1,
              maximum: 10,
            },
            comments: {
              type: 'string',
              example:
                'Great workout today! Felt very energized and pushed myself harder than usual.',
            },
            wouldRecommend: { type: 'boolean', example: true },
          },
        },
        trainerNotes: {
          type: 'string',
          example:
            'Member showed excellent form and progression. Ready to increase weight next session. Focus on maintaining proper breathing technique.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'push_day',
            'upper_body',
            'progressive_overload',
            'personal_record',
          ],
        },
        environmentalData: {
          type: 'object',
          properties: {
            temperature: { type: 'number', example: 22 },
            humidity: { type: 'number', example: 45 },
            location: { type: 'string', example: 'Main Gym Floor 1' },
            equipmentUsed: {
              type: 'array',
              items: { type: 'string' },
              example: ['barbell', 'bench', 'dumbbells', 'cable_machine'],
            },
          },
        },
        performanceMetrics: {
          type: 'object',
          properties: {
            totalVolume: { type: 'number', example: 15480 },
            totalTimeUnderTension: { type: 'number', example: 3240 }, // seconds
            estimatedOneRepMax: { type: 'number', example: 95 },
            strengthEnduranceScore: { type: 'number', example: 87.5 },
            powerOutput: { type: 'number', example: 450 }, // watts
            metabolicEquivalent: { type: 'number', example: 8.2 },
          },
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
            fitnessLevel: {
              type: 'string',
              example: 'intermediate',
              enum: ['beginner', 'intermediate', 'advanced'],
            },
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
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T20:30:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T20:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid workout log ID provided.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view this workout log.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout log not found or does not exist.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workoutLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a workout log',
    description:
      'Updates an existing workout log with corrected data, additional exercises, updated performance metrics, or revised feedback. Only the creator or authorized personnel can modify workout logs. Maintains history of all changes for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout log to update',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Workout log updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        workoutDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T18:30:00.000Z',
        },
        workoutType: { type: 'string', example: 'strength_training' },
        duration: { type: 'number', example: 80 },
        totalCalories: { type: 'number', example: 475 },
        intensityLevel: { type: 'string', example: 'moderate' },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              exerciseId: { type: 'number', example: 1 },
              exerciseName: { type: 'string', example: 'Bench Press' },
              sets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    setNumber: { type: 'number', example: 1 },
                    reps: { type: 'number', example: 12 },
                    weight: { type: 'number', example: 82.5 },
                    weightUnit: { type: 'string', example: 'kg' },
                    rpe: { type: 'number', example: 7.5 },
                    completed: { type: 'boolean', example: true },
                  },
                },
              },
              notes: {
                type: 'string',
                example: 'Updated weight - increased by 2.5kg',
              },
            },
          },
        },
        memberFeedback: {
          type: 'object',
          properties: {
            energyLevel: { type: 'number', example: 8 },
            workoutEnjoyment: { type: 'number', example: 9 },
            difficultyRating: { type: 'number', example: 7 },
            comments: {
              type: 'string',
              example:
                'Updated feedback - felt even better than initially recorded',
            },
          },
        },
        trainerNotes: {
          type: 'string',
          example:
            'Updated notes - member exceeded expectations, ready for progression',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'push_day',
            'upper_body',
            'progressive_overload',
            'personal_record',
            'updated',
          ],
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-20T14:30:00.000Z',
        },
        updatedBy: { type: 'number', example: 45 },
        changeLog: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'duration' },
              oldValue: { type: 'number', example: 75 },
              newValue: { type: 'number', example: 80 },
              changedAt: { type: 'string', format: 'date-time' },
              changedBy: { type: 'number', example: 45 },
            },
          },
        },
        message: {
          type: 'string',
          example:
            'Workout log updated successfully with performance improvements',
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
      'Forbidden - Insufficient permissions to update this workout log.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout log not found or does not exist.',
  })
  @ApiBody({
    type: UpdateWorkoutLogDto,
    description:
      'Updated workout log data - include only fields that need to be changed',
    examples: {
      add_exercise: {
        summary: 'Add missing exercise to completed workout',
        value: {
          exercises: [
            {
              exerciseId: 4,
              exerciseName: 'Push-ups',
              muscleGroups: ['chest', 'shoulders', 'triceps'],
              sets: [
                {
                  setNumber: 1,
                  reps: 15,
                  rpe: 6,
                  completed: true,
                },
                {
                  setNumber: 2,
                  reps: 12,
                  rpe: 7,
                  completed: true,
                },
              ],
              notes: 'Added finisher exercise at the end',
            },
          ],
          duration: 85,
          totalCalories: 475,
          trainerNotes:
            'Added push-ups as finisher - member completed extra work',
        },
      },
      correct_weights: {
        summary: 'Correct weight measurements',
        value: {
          exercises: [
            {
              exerciseId: 1,
              exerciseName: 'Bench Press',
              sets: [
                {
                  setNumber: 1,
                  weight: 82.5, // Corrected from 80
                  weightUnit: 'kg',
                  notes: 'Corrected weight - includes bar weight',
                },
              ],
            },
          ],
          trainerNotes: 'Corrected barbell weight to include 20kg bar',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkoutLogDto: UpdateWorkoutLogDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutLogsService.update(id, updateWorkoutLogDto, user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a workout log',
    description:
      'Permanently removes a workout log from the system. This action cannot be undone and will affect member progress tracking and analytics. Only admins, the log creator, or users with appropriate permissions can delete workout logs. Preserves member privacy and data integrity.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout log to delete',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 },
  })
  @ApiResponse({
    status: 200,
    description: 'Workout log deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Workout log deleted successfully',
        },
        deletedLog: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            memberId: { type: 'number', example: 123 },
            workoutDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T18:30:00.000Z',
            },
            workoutType: { type: 'string', example: 'strength_training' },
            duration: { type: 'number', example: 75 },
            totalCalories: { type: 'number', example: 450 },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T09:15:00.000Z',
            },
            deletedBy: { type: 'number', example: 45 },
          },
        },
        impactOnAnalytics: {
          type: 'object',
          properties: {
            affectedMetrics: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'total_workouts',
                'weekly_average',
                'muscle_group_balance',
              ],
            },
            recalculationRequired: { type: 'boolean', example: true },
            memberProgressUpdated: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid workout log ID provided.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to delete this workout log.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout log not found or does not exist.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete workout log that is part of a training program or has dependencies.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutLogsService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get workout logs for a specific member',
    description:
      'Retrieves all workout logs for a specific gym member with detailed performance analytics, progress trends, and training insights. Provides comprehensive view of member fitness journey, workout patterns, and achievement milestones.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Unique identifier of the member',
    type: 'number',
    example: 123,
    schema: { type: 'number', minimum: 1 },
  })
  @ApiQuery({
    name: 'workoutType',
    required: false,
    type: String,
    description: 'Filter by workout type',
    example: 'strength_training',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter logs from this date',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter logs up to this date',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include detailed exercise data',
    example: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of logs to return',
    example: 50,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
    example: 'workoutDate',
    enum: ['workoutDate', 'duration', 'totalCalories', 'intensityLevel'],
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member workout logs',
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
            fitnessLevel: { type: 'string', example: 'intermediate' },
          },
        },
        workoutLogs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12345 },
              workoutDate: { type: 'string', format: 'date-time' },
              workoutType: { type: 'string', example: 'strength_training' },
              duration: { type: 'number', example: 75 },
              totalCalories: { type: 'number', example: 450 },
              intensityLevel: { type: 'string', example: 'moderate' },
              totalExercises: { type: 'number', example: 6 },
              totalSets: { type: 'number', example: 18 },
              exercises: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    exerciseName: { type: 'string', example: 'Bench Press' },
                    muscleGroups: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['chest', 'shoulders', 'triceps'],
                    },
                    totalVolume: { type: 'number', example: 2440 },
                    personalRecord: { type: 'boolean', example: true },
                  },
                },
              },
              performanceHighlights: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'personal_record',
                  'longest_workout',
                  'highest_calories',
                ],
              },
            },
          },
        },
        analytics: {
          type: 'object',
          properties: {
            totalWorkouts: { type: 'number', example: 156 },
            totalDuration: { type: 'number', example: 11700 }, // minutes
            averageDuration: { type: 'number', example: 75 },
            totalCaloriesBurned: { type: 'number', example: 70200 },
            averageCaloriesPerWorkout: { type: 'number', example: 450 },
            consistencyScore: { type: 'number', example: 87.3 }, // Percentage
            workoutStreak: { type: 'number', example: 12 }, // Current streak in days
            longestStreak: { type: 'number', example: 45 },
            favoriteWorkoutType: {
              type: 'string',
              example: 'strength_training',
            },
            mostTargetedMuscleGroup: { type: 'string', example: 'chest' },
            averageIntensity: { type: 'string', example: 'moderate' },
            weeklyFrequency: { type: 'number', example: 4.2 },
            monthlyFrequency: { type: 'number', example: 18.5 },
            personalRecords: { type: 'number', example: 23 },
            totalVolumeLifted: { type: 'number', example: 45600 }, // kg
            strongestWorkout: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date-time' },
                totalVolume: { type: 'number', example: 5200 },
                exercises: { type: 'number', example: 8 },
              },
            },
            longestWorkout: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date-time' },
                duration: { type: 'number', example: 120 },
              },
            },
            progressTrends: {
              type: 'object',
              properties: {
                strengthProgress: { type: 'number', example: 15.2 }, // % improvement
                enduranceProgress: { type: 'number', example: 8.7 },
                consistencyProgress: { type: 'number', example: 12.1 },
                overallProgress: { type: 'number', example: 11.8 },
              },
            },
          },
        },
        recentAchievements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'personal_record' },
              description: {
                type: 'string',
                example: 'New bench press record: 90kg x 8 reps',
              },
              date: { type: 'string', format: 'date-time' },
              exerciseName: { type: 'string', example: 'Bench Press' },
            },
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
      'Forbidden - Insufficient permissions to view member workout logs.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found or no workout logs exist.',
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.workoutLogsService.findByMember(memberId);
  }

  @Get('user/my-workout-logs')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get workout logs created by the current user',
    description:
      "Retrieves all workout logs that were created by the currently authenticated user (trainer/staff). Useful for trainers to review their logged sessions, monitor member progress they've tracked, and analyze their coaching effectiveness and member engagement.",
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
    name: 'memberId',
    required: false,
    type: Number,
    description: 'Filter by specific member ID',
    example: 123,
  })
  @ApiQuery({
    name: 'workoutType',
    required: false,
    type: String,
    description: 'Filter by workout type',
    example: 'strength_training',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter logs from this date',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter logs up to this date',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'includeMemberInfo',
    required: false,
    type: Boolean,
    description: 'Include detailed member information',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workout logs created by current user',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12345 },
              memberId: { type: 'number', example: 123 },
              workoutDate: { type: 'string', format: 'date-time' },
              workoutType: { type: 'string', example: 'strength_training' },
              duration: { type: 'number', example: 75 },
              totalCalories: { type: 'number', example: 450 },
              intensityLevel: { type: 'string', example: 'moderate' },
              totalExercises: { type: 'number', example: 6 },
              member: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  membershipType: { type: 'string', example: 'premium' },
                  fitnessLevel: { type: 'string', example: 'intermediate' },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 6 },
            totalRecords: { type: 'number', example: 134 },
            recordsPerPage: { type: 'number', example: 25 },
          },
        },
        coachingStats: {
          type: 'object',
          properties: {
            totalLogsCreated: { type: 'number', example: 134 },
            membersCoached: { type: 'number', example: 28 },
            averageSessionDuration: { type: 'number', example: 78 },
            totalTrainingHours: { type: 'number', example: 174.2 },
            logsThisMonth: { type: 'number', example: 23 },
            mostCoachedWorkoutType: {
              type: 'string',
              example: 'strength_training',
            },
            topMembersBySessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  memberId: { type: 'number', example: 123 },
                  memberName: { type: 'string', example: 'John Doe' },
                  sessionCount: { type: 'number', example: 15 },
                  totalDuration: { type: 'number', example: 1170 },
                },
              },
            },
            weeklyActivity: {
              type: 'object',
              description: 'Workout logs by day of week',
              example: {
                monday: 12,
                tuesday: 18,
                wednesday: 15,
                thursday: 20,
                friday: 16,
                saturday: 8,
                sunday: 3,
              },
            },
            coachingEffectiveness: {
              type: 'object',
              properties: {
                averageMemberSatisfaction: { type: 'number', example: 8.7 },
                memberRetentionRate: { type: 'number', example: 92.5 },
                progressAchievementRate: { type: 'number', example: 78.3 },
                sessionCompletionRate: { type: 'number', example: 95.1 },
              },
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
      'Forbidden - Insufficient permissions to view created workout logs.',
  })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.workoutLogsService.findByUser(user.userId);
  }
}
