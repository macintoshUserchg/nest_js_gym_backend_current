import {
  Controller,
  Get,
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
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('gym/:gymId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gym dashboard analytics' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return gym dashboard analytics.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  getGymDashboard(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymDashboard(gymId);
  }

  @Get('branch/:branchId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch dashboard analytics' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return branch dashboard analytics.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getBranchDashboard(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchDashboard(branchId);
  }

  @Get('gym/:gymId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gym member analytics' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return gym member analytics.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  getGymMemberAnalytics(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymMemberAnalytics(gymId);
  }

  @Get('branch/:branchId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch member analytics' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return branch member analytics.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getBranchMemberAnalytics(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchMemberAnalytics(branchId);
  }

  @Get('gym/:gymId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gym attendance analytics' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return gym attendance analytics.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  getGymAttendanceAnalytics(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymAttendanceAnalytics(gymId);
  }

  @Get('branch/:branchId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch attendance analytics' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return branch attendance analytics.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getBranchAttendanceAnalytics(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchAttendanceAnalytics(branchId);
  }

  @Get('gym/:gymId/payments/recent')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get 10 most recent payment transactions for a gym' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return recent payment transactions.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  getGymRecentPayments(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymRecentPayments(gymId);
  }

  @Get('branch/:branchId/payments/recent')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get 10 most recent payment transactions for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return recent payment transactions.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getBranchRecentPayments(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchRecentPayments(branchId);
  }
}
