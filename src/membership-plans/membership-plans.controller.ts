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
} from '@nestjs/swagger';
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('membership-plans')
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new membership plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully.' })
  @ApiBody({ type: CreateMembershipPlanDto })
  create(@Body() createDto: CreateMembershipPlanDto) {
    return this.plansService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all membership plans' })
  @ApiResponse({ status: 200, description: 'Return all plans.' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a membership plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Return the plan.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a membership plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @ApiBody({ type: UpdateMembershipPlanDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMembershipPlanDto,
  ) {
    return this.plansService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a membership plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.remove(id);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchMembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Get(':branchId/membership-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all membership plans for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return all membership plans for the branch.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.plansService.findByBranch(branchId);
  }
}
