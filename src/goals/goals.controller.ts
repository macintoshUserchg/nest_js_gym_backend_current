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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Goal } from '../entities/goals.entity';

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new goal',
    description:
      'Creates a new fitness goal for a member. Goals can be set by trainers or by members themselves (if allowed). Common goal types include weight loss, muscle gain, strength improvement, and endurance building.',
  })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully.',
    type: Goal,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid goal data or member ID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to create goals for this member.',
    examples: {
      insufficientPermissions: {
        summary: 'Cannot create goals for other members',
        value: {
          statusCode: 403,
          message:
            'You can only create goals for yourself or your assigned members',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
    examples: {
      memberNotFound: {
        summary: 'Member not found',
        value: {
          statusCode: 404,
          message: 'Member with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: CreateGoalDto,
    examples: {
      weightLossGoal: {
        summary: 'Weight loss goal',
        value: {
          memberId: 123,
          trainerId: 456,
          goal_type: 'Weight Loss',
          target_value: 10,
          target_timeline: '2024-06-30',
          milestone: {
            month1: 'Lose 2 kg',
            month2: 'Lose 4 kg',
            month3: 'Lose 6 kg',
            month4: 'Lose 8 kg',
            month5: 'Lose 10 kg',
          },
          status: 'active',
          completion_percent: 0,
          is_managed_by_member: false,
        },
      },
      muscleGainGoal: {
        summary: 'Muscle gain goal',
        value: {
          memberId: 123,
          goal_type: 'Muscle Gain',
          target_value: 5,
          target_timeline: '2024-08-31',
          milestone: {
            month1: 'Gain 1 kg muscle',
            month2: 'Gain 2 kg muscle',
            month3: 'Gain 3 kg muscle',
          },
          status: 'active',
          completion_percent: 0,
          is_managed_by_member: true,
        },
      },
      strengthGoal: {
        summary: 'Strength improvement goal',
        value: {
          memberId: 123,
          trainerId: 456,
          goal_type: 'Strength Improvement',
          target_value: 20,
          target_timeline: '2024-07-31',
          milestone: {
            week1: 'Increase bench press by 5kg',
            week4: 'Increase squat by 10kg',
            week8: 'Increase deadlift by 15kg',
            week12: 'Achieve 20kg total increase',
          },
          status: 'active',
          completion_percent: 0,
          is_managed_by_member: false,
        },
      },
    },
  })
  create(
    @Body() createGoalDto: CreateGoalDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.goalsService.create(createGoalDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all goals',
    description:
      'Retrieves all fitness goals in the system with optional filtering by status, member, trainer, or goal type. This endpoint is typically restricted to trainers and administrators.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter goals by status',
    example: 'active',
    enum: ['active', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @ApiQuery({
    name: 'memberId',
    required: false,
    type: Number,
    description: 'Filter goals by member ID',
    example: 123,
  })
  @ApiQuery({
    name: 'trainerId',
    required: false,
    type: Number,
    description: 'Filter goals by trainer ID',
    example: 456,
  })
  @ApiQuery({
    name: 'goalType',
    required: false,
    type: String,
    description: 'Filter goals by type',
    example: 'Weight Loss',
    enum: [
      'Weight Loss',
      'Muscle Gain',
      'Strength Improvement',
      'Endurance',
      'Flexibility',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Return all goals.',
    type: [Goal],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access goals.',
  })
  findAll() {
    return this.goalsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a goal by ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Return the goal.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  @ApiBody({ type: UpdateGoalDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.goalsService.update(id, updateGoalDto, user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.goalsService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get goals for a specific member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Return goals for the member.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.goalsService.findByMember(memberId);
  }

  @Get('user/my-goals')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get goals assigned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return goals assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.goalsService.findByUser(user.userId);
  }
}
