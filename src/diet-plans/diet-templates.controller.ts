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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a diet template (trainer/admin only)' })
  create(@Body() dto: CreateDietTemplateDto, @CurrentUser() user: User) {
    return this.templatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all diet templates' })
  findAll(@CurrentUser() user: User, @Query() filters: any) {
    return this.templatesService.findAll(user, filters);
  }

  @Get('trainer/my-templates')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get my diet templates (trainer only)' })
  findMyTemplates(@CurrentUser() user: User) {
    if (user.trainerId) {
      return this.templatesService.findByTrainer(parseInt(user.trainerId), user);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a diet template by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.findOne(id, user);
  }

  @Post(':id/copy')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Copy a diet template' })
  copyTemplate(
    @Param('id') id: string,
    @Body() dto: CopyDietTemplateDto,
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
  @ApiOperation({ summary: 'Rate a diet template' })
  rateTemplate(
    @Param('id') id: string,
    @Body() dto: RateDietTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.rateTemplate(id, dto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign template to a member (trainer/admin only)' })
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

  @Post(':id/substitute')
  @ApiOperation({ summary: 'Record meal substitution' })
  recordSubstitution(
    @Param('id') id: string,
    @Body() dto: SubstituteMealDto,
    @CurrentUser() user: User,
  ) {
    return { message: 'Substitution recording will be implemented' };
  }

  @Delete(':id')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a diet template' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templatesService.remove(id, user);
  }
}
