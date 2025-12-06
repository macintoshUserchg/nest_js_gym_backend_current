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
import { DietPlansService } from './diet-plans.service';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { User as UserEntity } from '../entities/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('diet-plans')
@Controller('diet-plans')
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new diet plan' })
  @ApiResponse({ status: 201, description: 'Diet plan created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiBody({ type: CreateDietDto })
  create(
    @Body() createDietDto: CreateDietDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.dietPlansService.create(createDietDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all diet plans' })
  @ApiResponse({ status: 200, description: 'Return all diet plans.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.dietPlansService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a diet plan by ID' })
  @ApiParam({ name: 'id', description: 'Diet plan ID' })
  @ApiResponse({ status: 200, description: 'Return the diet plan.' })
  @ApiResponse({ status: 404, description: 'Diet plan not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dietPlansService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a diet plan' })
  @ApiParam({ name: 'id', description: 'Diet plan ID' })
  @ApiResponse({ status: 200, description: 'Diet plan updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Diet plan not found.' })
  @ApiBody({ type: UpdateDietDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDietDto: UpdateDietDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.dietPlansService.update(id, updateDietDto, user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a diet plan' })
  @ApiParam({ name: 'id', description: 'Diet plan ID' })
  @ApiResponse({ status: 200, description: 'Diet plan deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Diet plan not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.dietPlansService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get diet plans for a specific member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return diet plans for the member.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.dietPlansService.findByMember(memberId);
  }

  @Get('user/my-diet-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get diet plans assigned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return diet plans assigned by the current user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.dietPlansService.findByUser(user.userId);
  }
}
