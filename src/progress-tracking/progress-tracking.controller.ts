import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressTrackingService } from './progress-tracking.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('progress-tracking')
@Controller('progress-tracking')
export class ProgressTrackingController {
  constructor(
    private readonly progressTrackingService: ProgressTrackingService,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new progress tracking record' })
  @ApiResponse({
    status: 201,
    description: 'Progress tracking record created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiBody({ type: CreateProgressDto })
  create(
    @Body() createProgressDto: CreateProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.create(createProgressDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all progress tracking records' })
  @ApiResponse({
    status: 200,
    description: 'Return all progress tracking records.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.progressTrackingService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a progress tracking record by ID' })
  @ApiParam({ name: 'id', description: 'Progress tracking record ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the progress tracking record.',
  })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.progressTrackingService.findOne(id.toString());
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a progress tracking record' })
  @ApiParam({ name: 'id', description: 'Progress tracking record ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress tracking record updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found.',
  })
  @ApiBody({ type: UpdateProgressDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.update(
      id.toString(),
      updateProgressDto,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a progress tracking record' })
  @ApiParam({ name: 'id', description: 'Progress tracking record ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress tracking record deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 404,
    description: 'Progress tracking record not found.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.progressTrackingService.remove(id.toString(), user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get progress tracking records for a specific member',
  })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return progress tracking records for the member.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.progressTrackingService.findByMember(memberId);
  }

  @Get('user/my-progress-records')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get progress tracking records assigned by the current user',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return progress tracking records assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.progressTrackingService.findByUser(user.userId);
  }
}
