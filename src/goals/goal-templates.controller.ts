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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { GoalTemplatesService } from './goal-templates.service';
import {
  CreateGoalTemplateDto,
  UpdateGoalTemplateDto,
} from './dto/create-goal-template.dto';

@ApiTags('goal-templates')
@Controller('goal-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GoalTemplatesController {
  constructor(private readonly goalTemplatesService: GoalTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a goal template' })
  create(@Body() dto: CreateGoalTemplateDto, @CurrentUser() user: User) {
    return this.goalTemplatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goal templates' })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  findAll(
    @CurrentUser() user: User,
    @Query('tags') tags?: string,
    @Query('is_active') is_active?: string,
  ) {
    const filters = {
      tags: tags ? tags.split(',') : undefined,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
    };
    return this.goalTemplatesService.findAll(user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal template by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalTemplatesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal template' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.goalTemplatesService.update(id, dto, user);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Copy a goal template' })
  copy(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalTemplatesService.copy(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal template' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.goalTemplatesService.remove(id, user);
  }
}
