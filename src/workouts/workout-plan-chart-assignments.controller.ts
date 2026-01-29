import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WorkoutPlanChartAssignmentsService } from './workout-plan-chart-assignments.service';
import { CreateChartAssignmentDto } from './dto/create-chart-assignment.dto';
import { UpdateChartAssignmentDto } from './dto/update-chart-assignment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/permissions.enum';
import { ChartAssignmentStatus } from '../entities/workout_plan_chart_assignments.entity';

@ApiTags('Chart Assignments')
@ApiBearerAuth('JWT-auth')
@Controller('chart-assignments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WorkoutPlanChartAssignmentsController {
  constructor(private readonly assignmentsService: WorkoutPlanChartAssignmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  @ApiOperation({ summary: 'Assign a workout chart to a member' })
  async create(@Body() dto: CreateChartAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chart assignments' })
  @ApiQuery({ name: 'memberId', required: false, type: Number })
  @ApiQuery({ name: 'chartId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ChartAssignmentStatus })
  async findAll(
    @Query('memberId', new ParseIntPipe({ optional: true })) memberId?: number,
    @Query('chartId') chartId?: string,
    @Query('status') status?: ChartAssignmentStatus,
  ) {
    return this.assignmentsService.findAll({ memberId, chartId, status });
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get active chart assignments for a member' })
  async getMemberAssignments(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.assignmentsService.getMemberActiveAssignments(memberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific chart assignment' })
  async findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  @ApiOperation({ summary: 'Update a chart assignment' })
  async update(@Param('id') id: string, @Body() dto: UpdateChartAssignmentDto) {
    return this.assignmentsService.update(id, dto);
  }

  @Post(':id/substitutions')
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Add an exercise substitution to an assignment' })
  async addSubstitution(
    @Param('id') id: string,
    @Body() body: { original_exercise: string; substituted_exercise: string; reason?: string },
  ) {
    return this.assignmentsService.addSubstitution(id, body);
  }

  @Post(':id/exercise-completion')
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Record exercise completion for an assignment' })
  async recordExerciseCompletion(
    @Param('id') id: string,
    @Body() body: { exerciseName: string; completedSets: number; completedReps: number[] },
  ) {
    return this.assignmentsService.recordExerciseCompletion(
      id,
      body.exerciseName,
      body.completedSets,
      body.completedReps,
    );
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  @ApiOperation({ summary: 'Cancel a chart assignment' })
  async cancel(@Param('id') id: string) {
    return this.assignmentsService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Delete a chart assignment' })
  async delete(@Param('id') id: string) {
    return this.assignmentsService.delete(id);
  }
}
