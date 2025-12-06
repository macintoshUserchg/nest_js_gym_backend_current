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
  @ApiOperation({ summary: 'Create a new workout plan' })
  @ApiResponse({
    status: 201,
    description: 'Workout plan created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiBody({ type: CreateWorkoutPlanDto })
  create(
    @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutsService.create(createWorkoutPlanDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all workout plans' })
  @ApiResponse({ status: 200, description: 'Return all workout plans.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.workoutsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a workout plan by ID' })
  @ApiParam({ name: 'id', description: 'Workout plan ID' })
  @ApiResponse({ status: 200, description: 'Return the workout plan.' })
  @ApiResponse({ status: 404, description: 'Workout plan not found.' })
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
