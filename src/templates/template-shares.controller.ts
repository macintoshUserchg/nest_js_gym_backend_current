import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplateSharesService } from './template-shares.service';
import { User } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('template-shares')
@Controller('template-shares')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TemplateShareController {
  constructor(private readonly templateSharesService: TemplateSharesService) {}

  @Post()
  @ApiOperation({
    summary: 'Share a template with a trainer (admin only)',
    description:
      'Allows an admin to share a workout or diet template with a trainer. The trainer can view and use the template after accepting the share.',
  })
  @ApiResponse({
    status: 201,
    description: 'Template share created successfully',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'Template share created',
            value: {
              share_id: 'cb42e948-48b6-4b26-8855-b0db9c326f40',
              template_id: '91e3e02c-8c4e-4e17-918f-803bf9583194',
              template_type: 'workout',
              shared_with_trainerId: 81,
              shared_by_admin: 'd78870ff-d367-4e96-9ea1-6235be02f90f',
              admin_note: 'Please review this workout template',
              is_accepted: false,
              accepted_at: null,
              shared_at: '2026-01-31T16:34:56.043Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Template or trainer not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Share already exists',
  })
  create(
    @Body()
    body: {
      template_id: string;
      template_type: 'workout' | 'diet';
      trainerId: number;
      admin_note?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.templateSharesService.create(
      body.template_id,
      body.template_type,
      body.trainerId,
      user.userId,
      body.admin_note,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all template shares',
    description:
      'Retrieves all template shares. Admins see all shares with full admin details, trainers see only shares directed to them.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of template shares with admin details',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'List of template shares',
            value: [
              {
                share_id: 'cb42e948-48b6-4b26-8855-b0db9c326f40',
                template_id: '91e3e02c-8c4e-4e17-918f-803bf9583194',
                template_type: 'workout',
                shared_with_trainerId: 81,
                shared_by_admin: {
                  userId: 'd78870ff-d367-4e96-9ea1-6235be02f90f',
                  email: 'admin@fitnessfirstelite.com',
                  createdAt: '2026-01-29T14:17:43.747Z',
                  updatedAt: '2026-01-31T16:27:44.400Z',
                },
                admin_note: 'Please review this workout template',
                is_accepted: false,
                accepted_at: null,
                shared_at: '2026-01-31T16:34:56.043Z',
              },
            ],
          },
        },
      },
    },
  })
  findAll(@CurrentUser() user: User) {
    // If user is a trainer, only show shares for them
    const trainerId = user.trainerId ? parseInt(user.trainerId) : undefined;
    return this.templateSharesService.findAll(trainerId);
  }

  @Post(':id/accept')
  @ApiOperation({
    summary: 'Accept a shared template (trainer only)',
    description:
      'Allows a trainer to accept a template shared by an admin. After accepting, the trainer can view and use the template.',
  })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: 'cb42e948-48b6-4b26-8855-b0db9c326f40',
  })
  @ApiResponse({
    status: 200,
    description: 'Template share accepted',
    content: {
      'application/json': {
        examples: {
          trainer: {
            summary: 'Trainer accepted',
            value: {
              share_id: 'cb42e948-48b6-4b26-8855-b0db9c326f40',
              is_accepted: true,
              accepted_at: '2026-01-31T16:35:00.000Z',
            },
          },
          admin: {
            summary: 'Admin cannot accept',
            value: {
              message: 'Only trainers can accept template shares',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Share not found',
  })
  acceptShare(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.trainerId) {
      return { message: 'Only trainers can accept template shares' };
    }
    return this.templateSharesService.acceptShare(id, parseInt(user.trainerId));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a template share',
    description:
      'Deletes a template share. Admins can delete any share, trainers can only delete their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: 'f0f1a719-4e14-49f3-9d76-8b1c4f6b7513',
  })
  @ApiResponse({
    status: 200,
    description: 'Template share deleted',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: 'Share deleted',
            value: {
              success: true,
              message: 'Template share deleted',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Share not found',
  })
  remove(@Param('id') id: string) {
    return this.templateSharesService.remove(id);
  }
}
