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
import { DietTemplatesService } from './diet-templates.service';
import {
  CreateDietTemplateDto,
  UpdateDietTemplateDto,
  CopyDietTemplateDto,
  RateDietTemplateDto,
  SubstituteMealDto,
  AssignDietTemplateDto,
} from './dto/create-diet-template.dto';

@ApiTags('diet-templates')
@Controller('diet-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DietTemplatesController {
  constructor(private readonly templatesService: DietTemplatesService) {}

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a diet template (trainer/admin only)',
    description:
      'Creates a new diet template with meals. Trainers can create templates for themselves, admins can create for anyone.',
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
              template_id: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
              title: 'Weight Loss Diet Plan',
              message: 'Diet template created successfully',
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
  create(@Body() dto: CreateDietTemplateDto, @CurrentUser() user: User) {
    return this.templatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all diet templates',
    description:
      'Retrieves all diet templates with optional filtering. Results are paginated and can be filtered by visibility, goal type, etc.',
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
    name: 'goal_type',
    required: false,
    enum: [
      'weight_loss',
      'weight_gain',
      'muscle_gain',
      'maintenance',
      'general_fitness',
    ],
    description: 'Filter by goal type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of diet templates with pagination',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'Paginated list of diet templates',
            value: {
              items: [
                {
                  template_id: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
                  trainerId: null,
                  title: 'Weight Loss Diet Plan',
                  description: 'Calorie deficit for weight loss',
                  visibility: 'GYM_PUBLIC',
                  goal_type: 'weight_loss',
                  target_calories: 1800,
                  duration_days: 30,
                  is_shared_gym: false,
                  is_active: true,
                  version: 1,
                  parent_template_id: null,
                  usage_count: 1,
                  avg_rating: 4.5,
                  rating_count: 2,
                  notes: 'Recommended for beginner clients',
                  tags: ['weight-loss', 'low-carb'],
                  meals: [],
                  created_at: '2026-01-31T14:30:00.000Z',
                  updated_at: '2026-01-31T14:30:00.000Z',
                },
                {
                  template_id: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
                  trainerId: 81,
                  title: 'Muscle Gain Plan',
                  description: 'High protein for muscle building',
                  visibility: 'PRIVATE',
                  goal_type: 'muscle_gain',
                  target_calories: 2800,
                  duration_days: 60,
                  is_shared_gym: false,
                  is_active: true,
                  version: 1,
                  parent_template_id: null,
                  usage_count: 0,
                  avg_rating: null,
                  rating_count: 0,
                  notes: null,
                  tags: ['muscle', 'protein'],
                  meals: [],
                  created_at: '2026-01-31T15:00:00.000Z',
                  updated_at: '2026-01-31T15:00:00.000Z',
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
  findAll(@CurrentUser() user: User, @Query() filters: any) {
    return this.templatesService.findAll(user, filters);
  }

  @Get('trainer/my-templates')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get my diet templates (trainer only)',
    description:
      'Retrieves all diet templates created by the currently authenticated trainer.',
  })
  @ApiResponse({
    status: 200,
    description: "List of trainer's templates",
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only trainers can access this endpoint',
  })
  findMyTemplates(@CurrentUser() user: User) {
    if (user.trainerId) {
      return this.templatesService.findByTrainer(
        parseInt(user.trainerId),
        user,
      );
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a diet template by ID',
    description:
      'Retrieves detailed information about a specific diet template including all meals. Users can view public templates or their own templates.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
  })
  @ApiResponse({
    status: 200,
    description: 'Template details with meals',
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
    summary: 'Copy a diet template',
    description:
      'Creates a copy of an existing template. The new template will be owned by the user making the request.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to copy (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
    @Body() dto: CopyDietTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.copyTemplate(id, dto, user);
  }

  @Post(':id/share')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Share template to trainer (admin only)',
    description:
      'Shares a diet template with a specific trainer. The trainer will be able to view and use the template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to share (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
          example: 'Recommended for your weight loss clients',
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
    return this.templatesService.shareToTrainer(
      id,
      body.trainerId,
      user,
      body.adminNote,
    );
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
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
      return this.templatesService.acceptSharedTemplate(
        body.shareId,
        parseInt(user.trainerId),
      );
    }
    return { message: 'Only trainers can accept shared templates' };
  }

  @Post(':id/rate')
  @ApiOperation({
    summary: 'Rate a diet template',
    description:
      "Allows users to rate a diet template. Ratings contribute to the template's average rating.",
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to rate (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
    @Body() dto: RateDietTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.rateTemplate(id, dto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign template to a member (trainer/admin only)',
    description:
      'Assigns a diet template to a member for a specific time period. The member will be able to follow this diet plan.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to assign (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
    @Body() dto: AssignDietTemplateDto,
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
    summary: 'Update a diet template (trainer/admin only)',
    description:
      'Updates an existing diet template. Trainers can only update their own templates, admins can update any template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to update (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
    @Body() dto: UpdateDietTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.update(id, dto, user);
  }

  @Post(':id/substitute')
  @ApiOperation({
    summary: 'Record meal substitution',
    description:
      'Records when a member substitutes one meal for another in a diet template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
  })
  @ApiResponse({
    status: 200,
    description: 'Substitution recorded',
  })
  recordSubstitution(
    @Param('id') id: string,
    @Body() dto: SubstituteMealDto,
    @CurrentUser() user: User,
  ) {
    return { message: 'Substitution recording will be implemented' };
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a diet template',
    description:
      'Deletes a diet template. Trainers can only delete their own templates, admins can delete any template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID to delete (UUID format)',
    example: '3c08ed00-e120-47f7-9a2a-ba381681e67e',
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
