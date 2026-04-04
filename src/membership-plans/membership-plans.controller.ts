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
  DefaultValuePipe,
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
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { paginate } from '../common/dto/pagination.dto';
import { MembershipPlan } from '../entities/membership_plans.entity';

@ApiTags('membership-plans')
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new membership plan',
    description:
      'Creates a new membership plan with pricing and duration details',
  })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully.',
    type: MembershipPlan,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 409,
    description: 'Plan with this name already exists.',
  })
  @ApiBody({
    type: CreateMembershipPlanDto,
    examples: {
      monthlyPlan: {
        summary: 'Create monthly premium plan',
        value: {
          name: 'Monthly Premium',
          description: 'Access to all gym facilities for one month',
          duration: 30,
          durationUnit: 'days',
          price: 7999,
          currency: 'USD',
          features: [
            'All Equipment',
            'Group Classes',
            'Personal Trainer 1 session/month',
          ],
          isActive: true,
          branchId: 'branch_123',
        },
      },
    },
  })
  create(@Body() createDto: CreateMembershipPlanDto) {
    return this.plansService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all membership plans',
    description:
      'Retrieve all membership plans with optional filtering by branch or price range',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter plans by branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter (in cents)',
    example: 1000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter (in cents)',
    example: 5000,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all plans.',
    type: [MembershipPlan],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.plansService.findAll(branchId, minPrice, maxPrice, page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a membership plan by ID',
    description:
      'Retrieves detailed information about a specific membership plan including current subscribers.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the plan.',
    examples: {
      success: {
        summary: 'Membership plan details',
        value: {
          id: 1,
          name: 'Monthly Premium',
          description: 'Access to all gym facilities for one month',
          duration: 30,
          durationUnit: 'days',
          price: 7999,
          currency: 'USD',
          features: [
            'All Equipment',
            'Group Classes',
            'Personal Trainer 1 session/month',
          ],
          isActive: true,
          branchId: 'branch_123',
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found.',
    examples: {
      notFound: {
        summary: 'Plan ID not found',
        value: {
          statusCode: 404,
          message: 'Membership plan with ID 1 not found',
          error: 'Not Found',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a membership plan',
    description:
      'Updates membership plan details such as price, duration, or features. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully.',
    examples: {
      success: {
        summary: 'Plan updated successfully',
        value: {
          id: 1,
          name: 'Monthly Premium',
          description:
            'Access to all gym facilities for one month with extended hours',
          duration: 30,
          durationUnit: 'days',
          price: 8999,
          currency: 'USD',
          features: [
            'All Equipment',
            'Group Classes',
            'Personal Trainer 2 sessions/month',
            'Extended Hours Access',
          ],
          isActive: true,
          branchId: 'branch_123',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found.',
    examples: {
      notFound: {
        summary: 'Plan ID not found',
        value: {
          statusCode: 404,
          message: 'Membership plan with ID 1 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateMembershipPlanDto,
    examples: {
      updatePrice: {
        summary: 'Update plan price',
        value: {
          price: 8999,
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMembershipPlanDto,
  ) {
    return this.plansService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a membership plan',
    description:
      'Permanently deletes a membership plan. Requires admin privileges. Active subscriptions will not be affected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Plan deleted successfully.',
    examples: {
      success: {
        summary: 'Plan deleted successfully',
        value: {
          message: 'Membership plan has been successfully deleted',
          deletedPlanId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found.',
    examples: {
      notFound: {
        summary: 'Plan ID not found',
        value: {
          statusCode: 404,
          message: 'Membership plan with ID 1 not found',
          error: 'Not Found',
        },
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'Return all membership plans for the branch.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.plansService.findByBranch(branchId);
  }
}

@ApiTags('gyms')
@Controller('gyms')
export class GymMembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Get(':gymId/membership-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all membership plans for a gym' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all membership plans for the gym.',
  })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  findByGym(@Param('gymId') gymId: string) {
    return this.plansService.findByGym(gymId);
  }
}
