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
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Create a workout template (trainer/admin only)',
    description:
      'Creates a new workout template with exercises. Trainers can create templates for themselves, admins can create for anyone.',
  })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'Template created',
            value: {
              template_id: '91e3e02c-8c4e-4e17-918f-803bf9583194',
              title: 'Test Strength Template',
              message: 'Workout template created successfully',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(@Body() dto: CreateWorkoutTemplateDto, @CurrentUser() user: User) {
    return this.templatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all workout templates',
    description:
      'Retrieves all workout templates with optional filtering. Results are paginated and can be filtered by visibility, type, difficulty, etc.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'visibility',
    required: false,
    enum: ['PRIVATE', 'GYM_PUBLIC'],
    description: 'Filter by template visibility',
  })
  @ApiQuery({
    name: 'chart_type',
    required: false,
    enum: ['STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'COMPOUND'],
    description: 'Filter by chart type',
  })
  @ApiQuery({
    name: 'difficulty_level',
    required: false,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    description: 'Filter by difficulty level',
  })
  @ApiResponse({
    status: 200,
    description: 'List of workout templates with pagination',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'Paginated list of templates',
            value: {
              items: [
                {
                  template_id: '91e3e02c-8c4e-4e17-918f-803bf9583194',
                  trainerId: 81,
                  title: 'Updated Title',
                  description: 'Basic strength training',
                  visibility: 'GYM_PUBLIC',
                  chart_type: 'STRENGTH',
                  difficulty_level: 'BEGINNER',
                  plan_type: 'strength',
                  duration_days: 30,
                  is_shared_gym: false,
                  is_active: true,
                  version: 1,
                  parent_template_id: null,
                  usage_count: 1,
                  avg_rating: null,
                  rating_count: 0,
                  notes: 'Updated via PATCH',
                  tags: null,
                  exercises: [],
                  created_at: '2026-01-31T16:08:48.653Z',
                  updated_at: '2026-01-31T16:26:51.224Z',
                },
                {
                  template_id: '26749523-8495-40f7-823e-a6303433f1ca',
                  trainerId: null,
                  title: 'Test HIIT Workout',
                  description: 'High intensity interval training for fat loss',
                  visibility: 'GYM_PUBLIC',
                  chart_type: 'HIIT',
                  difficulty_level: 'INTERMEDIATE',
                  plan_type: 'cardio',
                  duration_days: 30,
                  is_shared_gym: false,
                  is_active: true,
                  version: 1,
                  parent_template_id: null,
                  usage_count: 0,
                  avg_rating: null,
                  rating_count: 0,
                  notes: null,
                  tags: null,
                  exercises: [],
                  created_at: '2026-01-31T16:07:30.867Z',
                  updated_at: '2026-01-31T16:07:30.867Z',
                },
              ],
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      },
    },
  })
  findAll(@CurrentUser() user: User, @Query() filters: FilterTemplatesDto) {
    return this.templatesService.findAll(user, filters);
  }

  @Get('trainer/my-templates')
  @Roles(UserRole.TRAINER)
  @ApiOperation({
    summary: 'Get my workout templates (trainer only)',
    description: 'Retrieves all workout templates created by the currently authenticated trainer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trainer\'s templates',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only trainers can access this endpoint',
  })
  findMyTemplates(@CurrentUser() user: User) {
    if (user.trainerId) {
      return this.templatesService.findByTrainer(parseInt(user.trainerId), user);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a workout template by ID',
    description:
      'Retrieves detailed information about a specific workout template including all exercises. Users can view public templates or their own templates.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 200,
    description: 'Template details',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.findOne(id, user);
  }

  @Post(':id/copy')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Copy a workout template',
    description:
      'Creates a copy of an existing template. The new template will be owned by the user making the request.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to copy (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 201,
    description: 'Template copied successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Source template not found',
  })
  copyTemplate(
    @Param('id') id: string,
    @Body() dto: CopyWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.copyTemplate(id, dto, user);
  }

  @Post(':id/share')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Share template to trainer (admin only)',
    description:
      'Shares a workout template with a specific trainer. The trainer will be able to view and use the template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to share (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trainerId: {
          type: 'number',
          example: 81,
          description: 'ID of the trainer to share with',
        },
        adminNote: {
          type: 'string',
          example: 'Please review this template for your clients',
          description: 'Optional note from admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Template shared successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template or trainer not found',
  })
  shareToTrainer(
    @Param('id') id: string,
    @Body() body: { trainerId: number; adminNote?: string },
    @CurrentUser() user: User,
  ) {
    return this.templatesService.shareToTrainer(id, body.trainerId, user, body.adminNote);
  }

  @Post(':id/accept')
  @Roles(UserRole.TRAINER)
  @ApiOperation({
    summary: 'Accept shared template (trainer only)',
    description:
      'Accepts a template that has been shared by an admin. After accepting, the trainer can use the template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 200,
    description: 'Template accepted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Share or template not found',
  })
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
  @ApiOperation({
    summary: 'Rate a workout template',
    description:
      'Allows users to rate a workout template. Ratings contribute to the template\'s average rating.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to rate (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          example: 5,
          description: 'Rating value from 1 to 5',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rating submitted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  rateTemplate(
    @Param('id') id: string,
    @Body() dto: RateWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.rateTemplate(id, dto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign template to a member (trainer/admin only)',
    description:
      'Assigns a workout template to a member for a specific time period. The member will be able to follow this workout plan.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to assign (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['memberId'],
      properties: {
        memberId: {
          type: 'number',
          example: 401,
          description: 'ID of the member to assign to',
        },
        assignmentId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Optional assignment ID for reassignment',
        },
        start_date: {
          type: 'string',
          format: 'date',
          example: '2026-02-01',
          description: 'Start date of the assignment',
        },
        end_date: {
          type: 'string',
          format: 'date',
          example: '2026-03-01',
          description: 'End date of the assignment',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Template assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template or member not found',
  })
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

  @Patch(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a workout template (trainer/admin only)',
    description:
      'Updates an existing workout template. Trainers can only update their own templates, admins can update any template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to update (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own templates',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.update(id, dto, user);
  }

  @Post(':id/substitute')
  @ApiOperation({
    summary: 'Record exercise substitution',
    description:
      'Records when a member substitutes one exercise for another in a workout template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 200,
    description: 'Substitution recorded',
  })
  recordSubstitution(
    @Param('id') id: string,
    @Body() dto: SubstituteExerciseDto,
    @CurrentUser() user: User,
  ) {
    return { message: 'Substitution recording will be implemented' };
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a workout template',
    description:
      'Deletes a workout template. Trainers can only delete their own templates, admins can delete any template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to delete (UUID format)',
    example: '91e3e02c-8c4e-4e17-918f-803bf9583194',
  })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own templates',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.remove(id, user);
  }
}
