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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('workouts')
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new workout plan',
    description:
      'Creates detailed workout plans and templates including structured exercise routines, progressive overload schedules, target muscle groups, equipment requirements, and coaching notes. This endpoint allows trainers to design comprehensive training programs for member fitness goals.',
  })
  @ApiResponse({
    status: 201,
    description: 'Workout plan created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'workout_123456789' },
        memberId: { type: 'number', example: 123 },
        planName: {
          type: 'string',
          example: 'Strength Building Program - Phase 1',
        },
        planType: {
          type: 'string',
          example: 'strength',
          enum: [
            'strength',
            'cardio',
            'flexibility',
            'hiit',
            'sports_specific',
            'rehabilitation',
            'general_fitness',
          ],
        },
        duration: { type: 'number', example: 12 }, // weeks
        durationUnit: {
          type: 'string',
          example: 'weeks',
          enum: ['days', 'weeks', 'months'],
        },
        difficulty: {
          type: 'string',
          example: 'intermediate',
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        sessionsPerWeek: { type: 'number', example: 4 },
        estimatedDuration: { type: 'number', example: 60 }, // minutes per session
        goal: {
          type: 'string',
          example: 'Build lean muscle mass and increase strength',
        },
        description: {
          type: 'string',
          example:
            'A comprehensive 12-week program focusing on compound movements and progressive overload',
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              exerciseId: { type: 'number', example: 1 },
              exerciseName: { type: 'string', example: 'Barbell Bench Press' },
              category: {
                type: 'string',
                example: 'compound',
                enum: ['compound', 'isolation', 'functional'],
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
                    reps: { type: 'number', example: 10 },
                    weight: { type: 'number', example: 60 },
                    weightUnit: {
                      type: 'string',
                      example: 'kg',
                      enum: ['kg', 'lbs', 'bodyweight', 'time_based'],
                    },
                    restTime: { type: 'number', example: 120 }, // seconds
                    tempo: {
                      type: 'string',
                      example: '3-1-1',
                      description: 'Down-Pause-Up time in seconds',
                    },
                    notes: {
                      type: 'string',
                      example:
                        'Focus on controlled descent and full range of motion',
                    },
                  },
                },
              },
              progression: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'weight',
                    enum: ['weight', 'reps', 'volume', 'time', 'complexity'],
                  },
                  frequency: {
                    type: 'string',
                    example: 'weekly',
                    enum: ['every_session', 'weekly', 'bi_weekly', 'monthly'],
                  },
                  increment: { type: 'number', example: 2.5 },
                  description: {
                    type: 'string',
                    example:
                      'Increase weight by 2.5kg each week if all sets completed',
                  },
                },
              },
              exerciseOrder: { type: 'number', example: 1 },
              isOptional: { type: 'boolean', example: false },
              alternatives: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'Dumbbell Bench Press',
                  'Push-ups',
                  'Chest Press Machine',
                ],
              },
            },
          },
        },
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: {
                type: 'string',
                example: 'monday',
                enum: [
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ],
              },
              sessionType: {
                type: 'string',
                example: 'upper_body',
                enum: [
                  'upper_body',
                  'lower_body',
                  'full_body',
                  'cardio',
                  'rest',
                  'flexibility',
                ],
              },
              duration: { type: 'number', example: 60 },
              focus: {
                type: 'string',
                example: 'Push movements - chest, shoulders, triceps',
              },
            },
          },
        },
        warmup: {
          type: 'object',
          properties: {
            duration: { type: 'number', example: 10 }, // minutes
            activities: {
              type: 'array',
              items: { type: 'string' },
              example: ['5 min cardio', 'Dynamic stretching', 'Joint mobility'],
            },
          },
        },
        cooldown: {
          type: 'object',
          properties: {
            duration: { type: 'number', example: 10 }, // minutes
            activities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Static stretching', 'Deep breathing', 'Relaxation'],
            },
          },
        },
        nutrition: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'string',
              example: 'Increase protein intake to 1.6g per kg body weight',
            },
            timing: {
              type: 'string',
              example: 'Consume protein within 30 minutes post-workout',
            },
            supplements: {
              type: 'array',
              items: { type: 'string' },
              example: ['Whey protein', 'Creatine', 'Omega-3'],
            },
          },
        },
        trackingMetrics: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'weight_progression',
            'body_measurements',
            'strength_tests',
            'endurance_metrics',
          ],
        },
        modifications: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Reduce weight if form breaks down',
            'Modify range of motion for injuries',
            'Substitute exercises for equipment limitations',
          ],
        },
        safetyNotes: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Always use safety spotters',
            'Stop if experiencing pain',
            'Maintain proper form over heavy weights',
          ],
        },
        status: {
          type: 'string',
          example: 'active',
          enum: ['active', 'completed', 'paused', 'cancelled'],
        },
        isTemplate: { type: 'boolean', example: false },
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
    description: 'Invalid workout plan data provided or validation failed.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to create workout plans.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found or does not exist.',
  })
  @ApiBody({
    type: CreateWorkoutPlanDto,
    description:
      'Workout plan structure including exercises, sets, progressions, and coaching guidelines',
    examples: {
      strength_program: {
        summary: '12-week strength building program',
        value: {
          memberId: 123,
          planName: 'Strength Building Program - Phase 1',
          planType: 'strength',
          duration: 12,
          durationUnit: 'weeks',
          difficulty: 'intermediate',
          sessionsPerWeek: 4,
          estimatedDuration: 60,
          goal: 'Build lean muscle mass and increase overall strength by 20%',
          description:
            'A comprehensive program focusing on compound movements with progressive overload',
          exercises: [
            {
              exerciseId: 1,
              exerciseName: 'Barbell Bench Press',
              category: 'compound',
              muscleGroups: ['chest', 'shoulders', 'triceps'],
              equipment: ['barbell', 'bench', 'weight_plates'],
              sets: [
                {
                  setNumber: 1,
                  reps: 10,
                  weight: 60,
                  weightUnit: 'kg',
                  restTime: 120,
                  tempo: '3-1-1',
                  notes: 'Focus on controlled descent and full range of motion',
                },
              ],
              progression: {
                type: 'weight',
                frequency: 'weekly',
                increment: 2.5,
                description:
                  'Increase weight by 2.5kg each week if all sets completed',
              },
              exerciseOrder: 1,
            },
          ],
          schedule: [
            {
              day: 'monday',
              sessionType: 'upper_body',
              duration: 60,
              focus: 'Push movements',
            },
            {
              day: 'tuesday',
              sessionType: 'lower_body',
              duration: 60,
              focus: 'Legs and glutes',
            },
            {
              day: 'thursday',
              sessionType: 'upper_body',
              duration: 60,
              focus: 'Pull movements',
            },
            {
              day: 'friday',
              sessionType: 'full_body',
              duration: 60,
              focus: 'Compound movements',
            },
          ],
          trackingMetrics: [
            'weight_progression',
            'body_measurements',
            'strength_tests',
          ],
        },
      },
      cardio_program: {
        summary: '8-week cardiovascular improvement program',
        value: {
          memberId: 456,
          planName: 'Cardio Fitness Improvement',
          planType: 'cardio',
          duration: 8,
          durationUnit: 'weeks',
          difficulty: 'beginner',
          sessionsPerWeek: 3,
          estimatedDuration: 45,
          goal: 'Improve cardiovascular endurance and burn body fat',
          exercises: [
            {
              exerciseId: 3,
              exerciseName: 'Treadmill Interval Training',
              category: 'cardio',
              muscleGroups: ['legs', 'cardiovascular'],
              equipment: ['treadmill'],
              sets: [
                {
                  setNumber: 1,
                  reps: 1,
                  weight: 0,
                  weightUnit: 'time_based',
                  duration: 1800, // 30 minutes
                  notes:
                    'Maintain moderate intensity, alternate between brisk walk and jog',
                },
              ],
              progression: {
                type: 'time',
                frequency: 'bi_weekly',
                increment: 5,
                description:
                  'Increase session duration by 5 minutes every 2 weeks',
              },
            },
          ],
          schedule: [
            {
              day: 'monday',
              sessionType: 'cardio',
              duration: 45,
              focus: 'Steady state cardio',
            },
            {
              day: 'wednesday',
              sessionType: 'cardio',
              duration: 45,
              focus: 'Interval training',
            },
            {
              day: 'friday',
              sessionType: 'cardio',
              duration: 45,
              focus: 'Mixed intensity',
            },
          ],
          trackingMetrics: [
            'endurance_metrics',
            'heart_rate_zones',
            'calorie_burn',
          ],
        },
      },
    },
  })
  create(
    @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutsService.create(createWorkoutPlanDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all workout plans',
    description:
      'Retrieves comprehensive list of workout plans and templates with advanced filtering, analytics, and program insights. Supports filtering by plan type, difficulty, target goals, duration, and creator. Provides program performance metrics and member success rates.',
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
    description: 'Number of plans per page (default: 20, max: 100)',
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
    name: 'planType',
    required: false,
    type: String,
    description: 'Filter by plan type',
    example: 'strength',
    enum: [
      'strength',
      'cardio',
      'flexibility',
      'hiit',
      'sports_specific',
      'rehabilitation',
      'general_fitness',
    ],
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    type: String,
    description: 'Filter by difficulty level',
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by plan status',
    example: 'active',
    enum: ['active', 'completed', 'paused', 'cancelled'],
  })
  @ApiQuery({
    name: 'isTemplate',
    required: false,
    type: Boolean,
    description: 'Show only template plans',
    example: false,
  })
  @ApiQuery({
    name: 'creatorId',
    required: false,
    type: Number,
    description: 'Filter by plan creator',
    example: 45,
  })
  @ApiQuery({
    name: 'durationMin',
    required: false,
    type: Number,
    description: 'Minimum duration in weeks',
    example: 4,
  })
  @ApiQuery({
    name: 'durationMax',
    required: false,
    type: Number,
    description: 'Maximum duration in weeks',
    example: 24,
  })
  @ApiQuery({
    name: 'sessionsPerWeek',
    required: false,
    type: Number,
    description: 'Filter by sessions per week',
    example: 3,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
    example: 'createdAt',
    enum: [
      'createdAt',
      'planName',
      'duration',
      'difficulty',
      'sessionsPerWeek',
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
    description: 'Successfully retrieved workout plans',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'workout_123456789' },
              memberId: { type: 'number', example: 123 },
              planName: {
                type: 'string',
                example: 'Strength Building Program - Phase 1',
              },
              planType: { type: 'string', example: 'strength' },
              duration: { type: 'number', example: 12 },
              difficulty: { type: 'string', example: 'intermediate' },
              sessionsPerWeek: { type: 'number', example: 4 },
              estimatedDuration: { type: 'number', example: 60 },
              goal: {
                type: 'string',
                example: 'Build lean muscle mass and increase strength',
              },
              status: { type: 'string', example: 'active' },
              isTemplate: { type: 'boolean', example: false },
              totalExercises: { type: 'number', example: 12 },
              completionRate: { type: 'number', example: 78.5 }, // percentage
              memberProgress: { type: 'number', example: 45.2 }, // percentage completed
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
                  role: { type: 'string', example: 'trainer' },
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
            totalPlans: { type: 'number', example: 156 },
            activePlans: { type: 'number', example: 98 },
            templatePlans: { type: 'number', example: 34 },
            averageDuration: { type: 'number', example: 10.5 }, // weeks
            averageCompletionRate: { type: 'number', example: 72.3 },
            mostPopularPlanType: { type: 'string', example: 'strength' },
            mostRequestedDifficulty: {
              type: 'string',
              example: 'intermediate',
            },
            plansCreatedThisMonth: { type: 'number', example: 23 },
            successfulCompletions: { type: 'number', example: 67 },
            averageSessionsPerWeek: { type: 'number', example: 3.8 },
            topPerformers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  creatorId: { type: 'number', example: 45 },
                  creatorName: { type: 'string', example: 'Jane Smith' },
                  plansCreated: { type: 'number', example: 28 },
                  averageCompletionRate: { type: 'number', example: 85.2 },
                },
              },
            },
            programEffectiveness: {
              type: 'object',
              properties: {
                strengthPrograms: { type: 'number', example: 84.5 }, // average completion rate
                cardioPrograms: { type: 'number', example: 76.8 },
                flexibilityPrograms: { type: 'number', example: 91.2 },
                hiitPrograms: { type: 'number', example: 68.9 },
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
    description: 'Forbidden - Insufficient permissions to view workout plans.',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.workoutsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a workout plan by ID',
    description:
      'Retrieves detailed information about a specific workout plan including complete exercise definitions, progression schedules, member assignments, performance tracking, and program analytics. Provides comprehensive view of the training program structure and effectiveness.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout plan',
    type: 'string',
    example: 'workout_123456789',
    schema: { type: 'string', pattern: '^workout_[0-9]+$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved workout plan details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'workout_123456789' },
        memberId: { type: 'number', example: 123 },
        planName: {
          type: 'string',
          example: 'Strength Building Program - Phase 1',
        },
        planType: {
          type: 'string',
          example: 'strength',
          enum: [
            'strength',
            'cardio',
            'flexibility',
            'hiit',
            'sports_specific',
            'rehabilitation',
            'general_fitness',
          ],
        },
        duration: { type: 'number', example: 12 },
        durationUnit: {
          type: 'string',
          example: 'weeks',
          enum: ['days', 'weeks', 'months'],
        },
        difficulty: {
          type: 'string',
          example: 'intermediate',
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        sessionsPerWeek: { type: 'number', example: 4 },
        estimatedDuration: { type: 'number', example: 60 },
        goal: {
          type: 'string',
          example:
            'Build lean muscle mass and increase overall strength by 20%',
        },
        description: {
          type: 'string',
          example:
            'A comprehensive 12-week program focusing on compound movements and progressive overload',
        },
        status: {
          type: 'string',
          example: 'active',
          enum: ['active', 'completed', 'paused', 'cancelled'],
        },
        isTemplate: { type: 'boolean', example: false },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T00:00:00.000Z',
        },
        targetEndDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-04-08T00:00:00.000Z',
        },
        completionPercentage: { type: 'number', example: 45.2 },
        currentWeek: { type: 'number', example: 5 },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              exerciseId: { type: 'number', example: 1 },
              exerciseName: { type: 'string', example: 'Barbell Bench Press' },
              category: {
                type: 'string',
                example: 'compound',
                enum: ['compound', 'isolation', 'functional'],
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
              difficulty: {
                type: 'string',
                example: 'intermediate',
                enum: ['beginner', 'intermediate', 'advanced'],
              },
              sets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    setNumber: { type: 'number', example: 1 },
                    reps: { type: 'number', example: 10 },
                    weight: { type: 'number', example: 60 },
                    weightUnit: {
                      type: 'string',
                      example: 'kg',
                      enum: ['kg', 'lbs', 'bodyweight', 'time_based'],
                    },
                    restTime: { type: 'number', example: 120 },
                    tempo: { type: 'string', example: '3-1-1' },
                    notes: {
                      type: 'string',
                      example:
                        'Focus on controlled descent and full range of motion',
                    },
                  },
                },
              },
              progression: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'weight',
                    enum: ['weight', 'reps', 'volume', 'time', 'complexity'],
                  },
                  frequency: {
                    type: 'string',
                    example: 'weekly',
                    enum: ['every_session', 'weekly', 'bi_weekly', 'monthly'],
                  },
                  increment: { type: 'number', example: 2.5 },
                  description: {
                    type: 'string',
                    example:
                      'Increase weight by 2.5kg each week if all sets completed',
                  },
                  currentLevel: { type: 'number', example: 3 },
                  maxLevel: { type: 'number', example: 12 },
                },
              },
              exerciseOrder: { type: 'number', example: 1 },
              isOptional: { type: 'boolean', example: false },
              alternatives: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'Dumbbell Bench Press',
                  'Push-ups',
                  'Chest Press Machine',
                ],
              },
              memberPerformance: {
                type: 'object',
                properties: {
                  averageWeight: { type: 'number', example: 65 },
                  bestPerformance: {
                    type: 'string',
                    example: '70kg x 12 reps',
                  },
                  completionRate: { type: 'number', example: 85.0 },
                  lastPerformed: { type: 'string', format: 'date-time' },
                  improvement: { type: 'number', example: 8.3 }, // percentage
                },
              },
            },
          },
        },
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: {
                type: 'string',
                example: 'monday',
                enum: [
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ],
              },
              sessionType: {
                type: 'string',
                example: 'upper_body',
                enum: [
                  'upper_body',
                  'lower_body',
                  'full_body',
                  'cardio',
                  'rest',
                  'flexibility',
                ],
              },
              duration: { type: 'number', example: 60 },
              focus: {
                type: 'string',
                example: 'Push movements - chest, shoulders, triceps',
              },
              exercises: {
                type: 'array',
                items: { type: 'number' },
                example: [1, 2, 3, 4],
              },
              completionRate: { type: 'number', example: 92.5 },
            },
          },
        },
        warmup: {
          type: 'object',
          properties: {
            duration: { type: 'number', example: 10 },
            activities: {
              type: 'array',
              items: { type: 'string' },
              example: ['5 min cardio', 'Dynamic stretching', 'Joint mobility'],
            },
          },
        },
        cooldown: {
          type: 'object',
          properties: {
            duration: { type: 'number', example: 10 },
            activities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Static stretching', 'Deep breathing', 'Relaxation'],
            },
          },
        },
        nutrition: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'string',
              example: 'Increase protein intake to 1.6g per kg body weight',
            },
            timing: {
              type: 'string',
              example: 'Consume protein within 30 minutes post-workout',
            },
            supplements: {
              type: 'array',
              items: { type: 'string' },
              example: ['Whey protein', 'Creatine', 'Omega-3'],
            },
            calorieTarget: { type: 'number', example: 2200 },
            macroBreakdown: {
              type: 'object',
              properties: {
                protein: { type: 'number', example: 30 },
                carbs: { type: 'number', example: 40 },
                fats: { type: 'number', example: 30 },
              },
            },
          },
        },
        trackingMetrics: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'weight_progression',
            'body_measurements',
            'strength_tests',
            'endurance_metrics',
          ],
        },
        modifications: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Reduce weight if form breaks down',
            'Modify range of motion for injuries',
            'Substitute exercises for equipment limitations',
          ],
        },
        safetyNotes: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Always use safety spotters',
            'Stop if experiencing pain',
            'Maintain proper form over heavy weights',
          ],
        },
        programAnalytics: {
          type: 'object',
          properties: {
            adherenceRate: { type: 'number', example: 87.5 },
            completionRate: { type: 'number', example: 72.3 },
            averageSessionRating: { type: 'number', example: 8.7 },
            goalAchievementRate: { type: 'number', example: 65.8 },
            injuryRate: { type: 'number', example: 2.1 },
            memberSatisfaction: { type: 'number', example: 9.2 },
            strengthGains: { type: 'number', example: 15.3 },
            enduranceImprovement: { type: 'number', example: 12.7 },
            bodyCompositionChange: {
              type: 'object',
              properties: {
                weightChange: { type: 'number', example: -2.5 },
                muscleGain: { type: 'number', example: 1.8 },
                fatLoss: { type: 'number', example: 4.3 },
              },
            },
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
            currentWeight: { type: 'number', example: 75.5 },
            targetWeight: { type: 'number', example: 72.0 },
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
            certifications: {
              type: 'array',
              items: { type: 'string' },
              example: ['NASM-CPT', 'Strength Specialist', 'Nutrition Coach'],
            },
          },
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-20T14:20:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid workout plan ID format.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view this workout plan.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout plan not found or does not exist.',
  })
  findOne(@Param('id') id: string) {
    return this.workoutsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a workout plan' })
  @ApiParam({ name: 'id', description: 'Workout plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout plan updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Workout plan not found.' })
  @ApiBody({ type: UpdateWorkoutPlanDto })
  update(
    @Param('id') id: string,
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutsService.update(id, updateWorkoutPlanDto, user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a workout plan' })
  @ApiParam({ name: 'id', description: 'Workout plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout plan deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Workout plan not found.' })
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.workoutsService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get workout plans for a specific member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return workout plans for the member.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.workoutsService.findByMember(memberId);
  }

  @Get('user/my-workout-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get workout plans assigned by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return workout plans assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.workoutsService.findByUser(user.userId);
  }
}
