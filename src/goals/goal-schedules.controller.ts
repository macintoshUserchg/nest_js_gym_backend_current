import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { UserRole } from '../common/enums/permissions.enum';
import { GoalSchedulesService } from './goal-schedules.service';
import {
  CreateGoalScheduleDto,
  CreateGoalScheduleFromTemplateDto,
  UpdatePeriodProgressDto,
  FilterGoalsDto,
} from './dto/create-goal-schedule.dto';

@ApiTags('goal-schedules')
@Controller('goal-schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class GoalSchedulesController {
  constructor(private readonly goalSchedulesService: GoalSchedulesService) {}

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a goal schedule (trainer/admin only)' })
  create(@Body() dto: CreateGoalScheduleDto, @CurrentUser() user: User) {
    return this.goalSchedulesService.create(dto, user);
  }

  @Post('from-template')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create goal schedule from template (trainer/admin only)',
  })
  createFromTemplate(
    @Body() dto: CreateGoalScheduleFromTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.goalSchedulesService.createFromTemplate(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goal schedules' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterGoalsDto) {
    return this.goalSchedulesService.findAll(user, filters);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get goal schedules for a member' })
  findByMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: User,
  ) {
    return this.goalSchedulesService.findByMember(memberId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal schedule by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalSchedulesService.findOne(id, user);
  }

  @Patch(':id/period')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update period progress (trainer/admin only)' })
  updatePeriodProgress(
    @Param('id') id: string,
    @Body() dto: UpdatePeriodProgressDto,
    @CurrentUser() user: User,
  ) {
    return this.goalSchedulesService.updatePeriodProgress(id, dto, user);
  }

  @Post(':id/pause')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Pause a goal schedule (trainer/admin only)' })
  pauseSchedule(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalSchedulesService.pauseSchedule(id, user);
  }

  @Post(':id/resume')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resume a paused goal schedule (trainer/admin only)',
  })
  resumeSchedule(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalSchedulesService.resumeSchedule(id, user);
  }

  @Post(':id/complete')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mark a goal schedule as completed (trainer/admin only)',
  })
  completeSchedule(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalSchedulesService.completeSchedule(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a goal schedule (trainer/admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalSchedulesService.remove(id, user);
  }
}
