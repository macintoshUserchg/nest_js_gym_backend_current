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
  Query,
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
import { BodyProgressService } from './body-progress.service';
import { CreateBodyProgressDto } from './dto/create-body-progress.dto';
import { UpdateBodyProgressDto } from './dto/update-body-progress.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('body-progress')
@Controller('body-progress')
export class BodyProgressController {
  constructor(private readonly bodyProgressService: BodyProgressService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new body progress record' })
  @ApiResponse({
    status: 201,
    description: 'Body progress record created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiBody({ type: CreateBodyProgressDto })
  create(
    @Body() createBodyProgressDto: CreateBodyProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bodyProgressService.create(createBodyProgressDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all body progress records' })
  @ApiResponse({
    status: 200,
    description: 'Return all body progress records.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.bodyProgressService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a body progress record by ID' })
  @ApiParam({ name: 'id', description: 'Body progress record ID' })
  @ApiResponse({ status: 200, description: 'Return the body progress record.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bodyProgressService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a body progress record' })
  @ApiParam({ name: 'id', description: 'Body progress record ID' })
  @ApiResponse({
    status: 200,
    description: 'Body progress record updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found.' })
  @ApiBody({ type: UpdateBodyProgressDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBodyProgressDto: UpdateBodyProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bodyProgressService.update(
      id,
      updateBodyProgressDto,
      user.userId,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a body progress record' })
  @ApiParam({ name: 'id', description: 'Body progress record ID' })
  @ApiResponse({
    status: 200,
    description: 'Body progress record deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bodyProgressService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get body progress records for a specific member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return body progress records for the member.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.bodyProgressService.findByMember(memberId);
  }

  @Get('user/my-body-progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get body progress records assigned by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return body progress records assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.bodyProgressService.findByUser(user.userId);
  }
}
