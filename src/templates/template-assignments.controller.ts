import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { TemplateAssignmentsService } from './template-assignments.service';
import {
  CreateTemplateAssignmentDto,
  UpdateProgressDto,
  FilterTemplateAssignmentsDto,
  SubstitutionDto,
} from './dto/create-template-assignment.dto';

@ApiTags('template-assignments')
@Controller('template-assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TemplateAssignmentsController {
  constructor(private readonly templateAssignmentsService: TemplateAssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a template assignment' })
  create(@Body() dto: CreateTemplateAssignmentDto, @CurrentUser() user: User) {
    return this.templateAssignmentsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all template assignments' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterTemplateAssignmentsDto) {
    return this.templateAssignmentsService.findAll(user, filters);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get template assignments for a member' })
  @ApiParam({ name: 'memberId', type: Number })
  findByMember(
    @Param('memberId') memberId: number,
    @CurrentUser() user: User,
    @Query('template_type') templateType?: 'workout' | 'diet',
  ) {
    return this.templateAssignmentsService.findByMember(memberId, user, templateType);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get template assignment analytics (admin only)' })
  getAnalytics(@CurrentUser() user: User) {
    return this.templateAssignmentsService.getAnalytics(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template assignment by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templateAssignmentsService.findOne(id, user);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update assignment progress' })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser() user: User,
  ) {
    return this.templateAssignmentsService.updateProgress(id, dto, user);
  }

  @Post(':id/substitute')
  @ApiOperation({ summary: 'Add a substitution' })
  addSubstitution(
    @Param('id') id: string,
    @Body() dto: SubstitutionDto,
    @CurrentUser() user: User,
  ) {
    return this.templateAssignmentsService.addSubstitution(id, dto, user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a template assignment' })
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templateAssignmentsService.cancel(id, user);
  }
}
