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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { UserRole } from '../common/enums/permissions.enum';
import { DietPlanAssignmentsService } from './diet-assignments.service';
import {
  CreateDietAssignmentDto,
  UpdateDietProgressDto,
  DietSubstitutionDto,
  FilterDietAssignmentsDto,
} from './dto/diet-assignment.dto';

@ApiTags('diet-plan-assignments')
@Controller('diet-plan-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DietPlanAssignmentsController {
  constructor(private readonly assignmentsService: DietPlanAssignmentsService) {}

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign diet plan to a member (trainer/admin only)' })
  create(@Body() dto: CreateDietAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all diet assignments' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterDietAssignmentsDto) {
    return this.assignmentsService.findAll(user, filters);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get diet assignments for a member' })
  findByMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.findByMember(parseInt(memberId), user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a diet assignment by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assignmentsService.findOne(id, user);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update diet assignment progress' })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateDietProgressDto,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.updateProgress(id, dto, user);
  }

  @Post(':id/substitute')
  @ApiOperation({ summary: 'Record meal substitution' })
  addSubstitution(
    @Param('id') id: string,
    @Body() dto: DietSubstitutionDto,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.addSubstitution(id, dto, user);
  }

  @Post(':id/link-chart')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Link diet assignment to chart assignment (trainer/admin only)' })
  linkToChart(
    @Param('id') id: string,
    @Body() body: { chart_assignment_id: string },
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.linkToChart(id, body.chart_assignment_id, user);
  }

  @Post(':id/cancel')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel diet assignment (trainer/admin only)' })
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assignmentsService.cancel(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete diet assignment (trainer/admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assignmentsService.remove(id, user);
  }
}
