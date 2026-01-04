import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
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
  @ApiParam({ name: 'gymId', description: 'Gym ID', example: 'gym-123' })
  @ApiResponse({
    status: 200,
    description: 'Return gym dashboard analytics.',
    schema: {
      example: {
        gym: {
          id: '7c3296b9-604b-40ee-8b7d-43e645c01bba',
          name: 'Fitness First Elite',
          branchId: '34b08021-5f99-4df8-a3c6-efb78c9a17e2',
          branchName: 'Fitness First - Downtown',
        },
        today: {
          payments: {
            online: 0,
            cash: 0,
          },
          attendance: 0,
          admissions: 0,
          renewals: 0,
          duesPaid: 0,
        },
        members: {
          total: 60,
          active: {
            current_active: 59,
            lastMonth_active: 55,
            change: {
              percent: 7.27,
              type: 'increase',
            },
          },
          inactive: 1,
          expiring: {
            today: 3,
            next10Days: 5,
            member_id: [850, 852, 855, 860, 862, 865, 870, 872],
          },
          birthdays: {
            today: 2,
            member_id: [840, 847],
          },
          dues: {
            count: 2,
            totalAmount: 249.98,
            members_id: [838, 845],
          },
        },
        resources: {
          trainers: {
            count: 12,
            trainers_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          },
          classes: {
            count: 12,
            classes_id: [
              'class-123',
              'class-124',
              'class-125',
              'class-126',
              'class-127',
              'class-128',
            ],
          },
        },
        revenue: {
          current: 339.96,
          lastMonth: 0,
          change: 100,
        },
        memberGrowth: {
          current: 59,
          lastMonth: 0,
          change: {
            percent: 100,
            type: 'increase',
          },
        },
        recentPayments: [
          {
            txnId: '282c8dd6-3f57-4eee-a2c6-e79662c9a304',
            amount: 79.99,
            method: 'card',
            status: 'completed',
            ref: 'TXN001',
            date: '2025-12-19T08:48:52.313Z',
            member: {
              id: 838,
              name: 'Alice Cooper',
              email: 'alice.cooper0@email.com',
            },
            invoice: {
              id: 'c84ba55c-ddcf-415f-bd26-95871af8e0fe',
              amount: 79.99,
              status: 'paid',
            },
            notes: 'Payment for January membership',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Gym with ID gym-999 not found',
        error: 'Not Found',
      },
    },
  })
  getGymDashboard(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymDashboard(gymId);
  }

  @Get('branch/:branchId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch dashboard analytics' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'branch-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Return branch dashboard analytics.',
    schema: {
      example: {
        gym: {
          id: 'gym-123',
          name: 'Fitness World',
          branchId: 'branch-456',
          branchName: 'Downtown Branch',
        },
        today: {
          payments: {
            online: 8,
            cash: 5,
          },
          attendance: 25,
          admissions: 1,
          renewals: 3,
          duesPaid: 2,
        },
        members: {
          total: 75,
          active: {
            current_active: 60,
            lastMonth_active: 58,
            change: {
              percent: 3.45,
              type: 'increase',
            },
          },
          inactive: 15,
          expiring: {
            today: 2,
            next10Days: 6,
            member_id: [850, 852, 860, 862, 865, 870, 872, 874],
          },
          birthdays: {
            today: 1,
            member_id: [840],
          },
          dues: {
            count: 4,
            totalAmount: 499.96,
            members_id: [838, 845, 850, 852],
          },
        },
        resources: {
          trainers: {
            count: 6,
            trainers_id: [1, 2, 3, 4, 5, 6],
          },
          classes: {
            count: 4,
            classes_id: ['class-123', 'class-124', 'class-125', 'class-126'],
          },
        },
        revenue: {
          current: 1899.96,
          lastMonth: 1500.0,
          change: 26.66,
        },
        memberGrowth: {
          current: 30,
          lastMonth: 25,
          change: {
            percent: 20.0,
            type: 'increase',
          },
        },
        recentPayments: [
          {
            txnId: '282c8dd6-3f57-4eee-a2c6-e79662c9a304',
            amount: 79.99,
            method: 'card',
            status: 'completed',
            ref: 'TXN001',
            date: '2025-12-19T08:48:52.313Z',
            member: {
              id: 838,
              name: 'Alice Cooper',
              email: 'alice.cooper0@email.com',
            },
            invoice: {
              id: 'c84ba55c-ddcf-415f-bd26-95871af8e0fe',
              amount: 79.99,
              status: 'paid',
            },
            notes: 'Payment for January membership',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID branch-999 not found',
        error: 'Not Found',
      },
    },
  })
  getBranchDashboard(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchDashboard(branchId);
  }

  @Get('gym/:gymId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gym member analytics' })
  @ApiParam({ name: 'gymId', description: 'Gym ID', example: 'gym-123' })
  @ApiResponse({
    status: 200,
    description: 'Return gym member analytics.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        members: {
          total: 150,
          active: 120,
          inactive: 30,
          expiringToday: 5,
          amount_due_members: 8,
          amount_due_members_id: [840, 842, 845, 848, 850, 852, 855, 860],
          total_amount_due: 2500.0,
          expiring3days: 12,
          expiring3days_members_id: [
            830, 832, 835, 838, 840, 842, 845, 848, 850, 852, 855, 860,
          ],
          birthday_today: 2,
          birthday_today_members_id: [840, 847],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Gym with ID gym-999 not found',
        error: 'Not Found',
      },
    },
  })
  getGymMemberAnalytics(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymMemberAnalytics(gymId);
  }

  @Get('branch/:branchId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch member analytics' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'branch-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Return branch member analytics.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        branchId: 'branch-456',
        branchName: 'Downtown Branch',
        members: {
          total: 75,
          active: 60,
          inactive: 15,
          expiringToday: 2,
          expiringToday_members_id: [850, 852],
          amount_due_members: 4,
          amount_due_members_id: [840, 842, 845, 848],
          expiring3days: 6,
          expiring3days_members_id: [830, 832, 835, 838, 840, 842],
          birthday_today: 1,
          birthday_today_members_id: [840],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID branch-999 not found',
        error: 'Not Found',
      },
    },
  })
  getBranchMemberAnalytics(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchMemberAnalytics(branchId);
  }

  @Get('gym/:gymId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gym attendance analytics' })
  @ApiParam({ name: 'gymId', description: 'Gym ID', example: 'gym-123' })
  @ApiResponse({
    status: 200,
    description: 'Return gym attendance analytics.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        branchId: 'branch-456',
        branchName: 'Main Branch',
        attendance: {
          today: 42,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Gym with ID gym-999 not found',
        error: 'Not Found',
      },
    },
  })
  getGymAttendanceAnalytics(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymAttendanceAnalytics(gymId);
  }

  @Get('branch/:branchId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get branch attendance analytics' })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'branch-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Return branch attendance analytics.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        branchId: 'branch-456',
        branchName: 'Downtown Branch',
        attendance: {
          today: 25,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID branch-999 not found',
        error: 'Not Found',
      },
    },
  })
  getBranchAttendanceAnalytics(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchAttendanceAnalytics(branchId);
  }

  @Get('gym/:gymId/payments/recent')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get 10 most recent payment transactions for a gym',
  })
  @ApiParam({ name: 'gymId', description: 'Gym ID', example: 'gym-123' })
  @ApiResponse({
    status: 200,
    description: 'Return recent payment transactions.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        branchId: 'branch-456',
        branchName: 'Main Branch',
        recentPayments: [
          {
            transactionId: 'txn-001',
            amount: 1200.0,
            method: 'credit_card',
            status: 'completed',
            referenceNumber: 'REF-12345',
            notes: 'Annual membership fee',
            createdAt: '2023-12-20T10:30:00Z',
            member: {
              id: 'member-001',
              fullName: 'John Doe',
              email: 'john@example.com',
            },
            invoice: {
              invoiceId: 'inv-001',
              totalAmount: 1200.0,
              status: 'paid',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Gym with ID gym-999 not found',
        error: 'Not Found',
      },
    },
  })
  getGymRecentPayments(@Param('gymId') gymId: string) {
    return this.analyticsService.getGymRecentPayments(gymId);
  }

  @Get('branch/:branchId/payments/recent')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get 10 most recent payment transactions for a branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'branch-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Return recent payment transactions.',
    schema: {
      example: {
        gymId: 'gym-123',
        gymName: 'Fitness World',
        branchId: 'branch-456',
        branchName: 'Downtown Branch',
        recentPayments: [
          {
            transactionId: 'txn-002',
            amount: 800.0,
            method: 'cash',
            status: 'completed',
            referenceNumber: 'REF-67890',
            notes: 'Monthly membership renewal',
            createdAt: '2023-12-21T14:15:00Z',
            member: {
              id: 'member-002',
              fullName: 'Jane Smith',
              email: 'jane@example.com',
            },
            invoice: {
              invoiceId: 'inv-002',
              totalAmount: 800.0,
              status: 'paid',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Branch with ID branch-999 not found',
        error: 'Not Found',
      },
    },
  })
  getBranchRecentPayments(@Param('branchId') branchId: string) {
    return this.analyticsService.getBranchRecentPayments(branchId);
  }

  @Get('trainer/:trainerId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get trainer dashboard analytics' })
  @ApiParam({ name: 'trainerId', description: 'Trainer ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Return trainer dashboard analytics.',
    schema: {
      example: {
        trainer: {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          specialization: 'Weight Training',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        classes: [
          {
            class_id: 'class-123',
            name: 'Morning Yoga',
            description: 'Relaxing yoga session',
            timings: 'morning',
            recurrence_type: 'daily',
            days_of_week: [1, 2, 3, 4, 5],
          },
        ],
        stats: {
          totalClasses: 1,
          totalMembers: 25,
        },
        assignedMembers: [
          {
            id: 838,
            fullName: 'Alice Cooper',
            email: 'alice.cooper0@email.com',
            phone: '+1234567890',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Trainer with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  getTrainerDashboard(@Param('trainerId') trainerId: string) {
    return this.analyticsService.getTrainerDashboard(trainerId);
  }
}
