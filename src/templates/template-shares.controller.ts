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
    schema: {
      type: 'object',
      properties: {
        share_id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        template_id: { type: 'string', example: 'w1a2b3c4-d5e6-7890-f1a2-b3c4d5e6f789' },
        template_type: { type: 'string', enum: ['workout', 'diet'] },
        shared_with_trainerId: { type: 'number', example: 81 },
        shared_by_adminId: { type: 'string', example: 'd78870ff-d367-4e96-9ea1-6235be02f90f' },
        admin_note: { type: 'string' },
        is_accepted: { type: 'boolean', example: false },
        created_at: { type: 'string', format: 'date-time' },
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
      'Retrieves all template shares. Admins can see all shares, trainers can only see shares directed to them.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of template shares',
    type: [Object],
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
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Template share accepted',
  })
  @ApiResponse({
    status: 404,
    description: 'Share not found',
  })
  acceptShare(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
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
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Template share deleted',
  })
  remove(@Param('id') id: string) {
    return this.templateSharesService.remove(id);
  }
}
