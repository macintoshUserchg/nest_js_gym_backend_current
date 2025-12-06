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
  @ApiOperation({ summary: 'Create a new workout log' })
  @ApiResponse({
    status: 201,
    description: 'Workout log created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiBody({ type: CreateWorkoutLogDto })
  create(
    @Body() createWorkoutLogDto: CreateWorkoutLogDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutLogsService.create(createWorkoutLogDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all workout logs' })
  @ApiResponse({ status: 200, description: 'Return all workout logs.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.workoutLogsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a workout log by ID' })
  @ApiParam({ name: 'id', description: 'Workout log ID' })
  @ApiResponse({ status: 200, description: 'Return the workout log.' })
  @ApiResponse({ status: 404, description: 'Workout log not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workoutLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a workout log' })
  @ApiParam({ name: 'id', description: 'Workout log ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout log updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Workout log not found.' })
  @ApiBody({ type: UpdateWorkoutLogDto })
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
  @ApiOperation({ summary: 'Delete a workout log' })
  @ApiParam({ name: 'id', description: 'Workout log ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout log deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Workout log not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.workoutLogsService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get workout logs for a specific member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return workout logs for the member.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.workoutLogsService.findByMember(memberId);
  }

  @Get('user/my-workout-logs')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get workout logs assigned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return workout logs assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.workoutLogsService.findByUser(user.userId);
  }
}
