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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { UserRole } from '../common/enums/permissions.enum';
import { WorkoutTemplatesService } from './workout-templates.service';
import {
  CreateWorkoutTemplateDto,
  UpdateWorkoutTemplateDto,
  CopyWorkoutTemplateDto,
  RateWorkoutTemplateDto,
  SubstituteExerciseDto,
  AssignWorkoutTemplateDto,
  FilterTemplatesDto,
} from './dto/create-workout-template.dto';

@ApiTags('workout-templates')
@Controller('workout-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class WorkoutTemplatesController {
  constructor(private readonly templatesService: WorkoutTemplatesService) {}

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a workout template (trainer/admin only)' })
  create(@Body() dto: CreateWorkoutTemplateDto, @CurrentUser() user: User) {
    return this.templatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workout templates' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterTemplatesDto) {
    return this.templatesService.findAll(user, filters);
  }

  @Get('trainer/my-templates')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Get my workout templates (trainer only)' })
  findMyTemplates(@CurrentUser() user: User) {
    if (user.trainerId) {
      return this.templatesService.findByTrainer(parseInt(user.trainerId), user);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workout template by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.findOne(id, user);
  }

  @Post(':id/copy')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Copy a workout template' })
  copyTemplate(
    @Param('id') id: string,
    @Body() dto: CopyWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.copyTemplate(id, dto, user);
  }

  @Post(':id/share')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Share template to trainer (admin only)' })
  shareToTrainer(
    @Param('id') id: string,
    @Body() body: { trainerId: number; adminNote?: string },
    @CurrentUser() user: User,
  ) {
    return this.templatesService.shareToTrainer(id, body.trainerId, user, body.adminNote);
  }

  @Post(':id/accept')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Accept shared template (trainer only)' })
  acceptSharedTemplate(
    @Param('id') id: string,
    @Body() body: { shareId: string },
    @CurrentUser() user: User,
  ) {
    if (user.trainerId) {
      return this.templatesService.acceptSharedTemplate(body.shareId, parseInt(user.trainerId));
    }
    return { message: 'Only trainers can accept shared templates' };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a workout template' })
  rateTemplate(
    @Param('id') id: string,
    @Body() dto: RateWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.rateTemplate(id, dto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign template to a member (trainer/admin only)' })
  assignToMember(
    @Param('id') id: string,
    @Body() dto: AssignWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.assignToMember(
      id,
      dto.memberId,
      dto.assignmentId,
      { start_date: dto.start_date, end_date: dto.end_date },
      user,
    );
  }

  @Post(':id/substitute')
  @ApiOperation({ summary: 'Record exercise substitution' })
  recordSubstitution(
    @Param('id') id: string,
    @Body() dto: SubstituteExerciseDto,
    @CurrentUser() user: User,
  ) {
    return { message: 'Substitution recording will be implemented' };
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a workout template' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.remove(id, user);
  }
}
