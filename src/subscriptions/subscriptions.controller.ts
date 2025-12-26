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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create a new membership subscription',
    description: 'Assigns a member to a membership plan with specified billing cycle, pricing, and benefits. Handles new member onboarding, plan upgrades/downgrades, and creates billing schedules. Ensures members have appropriate access based on their subscription type.'
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        planId: { type: 'number', example: 1 },
        planName: { type: 'string', example: 'Premium Monthly' },
        planType: { type: 'string', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly', 'lifetime'] },
        price: { type: 'number', example: 89.99 },
        currency: { type: 'string', example: 'USD', enum: ['USD', 'EUR', 'GBP'] },
        billingCycle: { type: 'string', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly'] },
        startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
        nextBillingDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
        status: { type: 'string', example: 'active', enum: ['active', 'cancelled', 'expired', 'suspended'] },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          example: ['gym_access', 'group_classes', 'personal_trainer_2_sessions', 'nutrition_consultation']
        },
        autoRenew: { type: 'boolean', example: true },
        paymentMethod: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'credit_card' },
            lastFour: { type: 'string', example: '4242' },
            brand: { type: 'string', example: 'visa' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription data provided or validation failed.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to create subscriptions.' })
  @ApiResponse({ status: 404, description: 'Member or membership plan not found.' })
  @ApiResponse({ status: 409, description: 'Member already has an active subscription.' })
  @ApiBody({ 
    type: CreateSubscriptionDto,
    description: 'Subscription details including member, plan, and billing information',
    examples: {
      new_member_monthly: {
        summary: 'New member with monthly plan',
        value: {
          memberId: 123,
          planId: 1,
          startDate: '2024-01-15T00:00:00.000Z',
          autoRenew: true,
          paymentMethodId: 'pm_1234567890',
          billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US'
          }
        }
      },
      plan_upgrade: {
        summary: 'Existing member upgrading plan',
        value: {
          memberId: 456,
          planId: 2,
          startDate: '2024-01-15T00:00:00.000Z',
          upgradeFromPlanId: 1,
          prorateAmount: 25.50,
          autoRenew: false
        }
      }
    }
  })
  create(@Body() createDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get all subscriptions',
    description: 'Retrieves comprehensive list of all membership subscriptions with filtering, pagination, and analytics. Supports filtering by status, plan type, member, billing cycle, and date ranges. Provides subscription metrics and revenue insights.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of subscriptions per page (default: 20, max: 100)', example: 20 })
  @ApiQuery({ name: 'memberId', required: false, type: Number, description: 'Filter by specific member ID', example: 123 })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by subscription status', example: 'active', enum: ['active', 'cancelled', 'expired', 'suspended', 'pending'] })
  @ApiQuery({ name: 'planType', required: false, type: String, description: 'Filter by plan type', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly', 'lifetime'] })
  @ApiQuery({ name: 'startDateFrom', required: false, type: String, description: 'Filter subscriptions starting from this date', example: '2024-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'startDateTo', required: false, type: String, description: 'Filter subscriptions starting up to this date', example: '2024-12-31T23:59:59.999Z' })
  @ApiQuery({ name: 'expiredOnly', required: false, type: Boolean, description: 'Show only expired subscriptions', example: false })
  @ApiQuery({ name: 'dueForRenewal', required: false, type: Boolean, description: 'Show subscriptions due for renewal within 7 days', example: false })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field', example: 'startDate', enum: ['startDate', 'endDate', 'createdAt', 'price', 'status'] })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, description: 'Sort order', example: 'desc', enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved subscriptions list',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12345 },
              memberId: { type: 'number', example: 123 },
              planName: { type: 'string', example: 'Premium Monthly' },
              planType: { type: 'string', example: 'monthly' },
              price: { type: 'number', example: 89.99 },
              currency: { type: 'string', example: 'USD' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              nextBillingDate: { type: 'string', format: 'date-time' },
              status: { type: 'string', example: 'active' },
              autoRenew: { type: 'boolean', example: true },
              daysUntilExpiry: { type: 'number', example: 15 },
              member: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  phoneNumber: { type: 'string', example: '+1-555-0123' }
                }
              },
              plan: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Premium Monthly' },
                  description: { type: 'string', example: 'Full gym access with premium amenities' },
                  benefits: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['gym_access', 'group_classes', 'personal_trainer_2_sessions']
                  }
                }
              }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 12 },
            totalRecords: { type: 'number', example: 234 },
            recordsPerPage: { type: 'number', example: 20 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false }
          }
        },
        analytics: {
          type: 'object',
          properties: {
            totalSubscriptions: { type: 'number', example: 234 },
            activeSubscriptions: { type: 'number', example: 198 },
            monthlyRecurringRevenue: { type: 'number', example: 17820.50 },
            averageSubscriptionValue: { type: 'number', example: 89.99 },
            churnRate: { type: 'number', example: 5.2 },
            topPlan: { type: 'string', example: 'Premium Monthly' },
            expiringThisMonth: { type: 'number', example: 23 },
            newThisMonth: { type: 'number', example: 31 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view subscriptions.' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get a subscription by ID',
    description: 'Retrieves detailed information about a specific subscription including complete member details, plan information, billing history, payment status, and access permissions. Provides comprehensive view of the membership relationship.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the subscription',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved subscription details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        planId: { type: 'number', example: 1 },
        planName: { type: 'string', example: 'Premium Monthly' },
        planType: { type: 'string', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly', 'lifetime'] },
        price: { type: 'number', example: 89.99 },
        currency: { type: 'string', example: 'USD', enum: ['USD', 'EUR', 'GBP'] },
        billingCycle: { type: 'string', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly'] },
        startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
        nextBillingDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
        status: { type: 'string', example: 'active', enum: ['active', 'cancelled', 'expired', 'suspended', 'pending'] },
        autoRenew: { type: 'boolean', example: true },
        cancellationDate: { type: 'string', format: 'date-time', example: null },
        cancellationReason: { type: 'string', example: null },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          example: ['gym_access', 'group_classes', 'personal_trainer_2_sessions', 'nutrition_consultation']
        },
        restrictions: {
          type: 'array',
          items: { type: 'string' },
          example: ['peak_hours_restriction']
        },
        paymentMethod: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'pm_1234567890' },
            type: { type: 'string', example: 'credit_card' },
            lastFour: { type: 'string', example: '4242' },
            brand: { type: 'string', example: 'visa', enum: ['visa', 'mastercard', 'amex', 'discover'] },
            expiryMonth: { type: 'number', example: 12 },
            expiryYear: { type: 'number', example: 2026 },
            isDefault: { type: 'boolean', example: true }
          }
        },
        billingAddress: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main St' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            zipCode: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'US' }
          }
        },
        billingHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 98765 },
              amount: { type: 'number', example: 89.99 },
              currency: { type: 'string', example: 'USD' },
              status: { type: 'string', example: 'paid', enum: ['paid', 'pending', 'failed', 'refunded'] },
              billingDate: { type: 'string', format: 'date-time' },
              paidDate: { type: 'string', format: 'date-time' },
              paymentMethod: { type: 'string', example: 'Visa ending in 4242' }
            }
          }
        },
        accessPermissions: {
          type: 'object',
          properties: {
            gymAccess: { type: 'boolean', example: true },
            groupClasses: { type: 'boolean', example: true },
            personalTraining: { type: 'boolean', example: true },
            nutritionConsultation: { type: 'boolean', example: true },
            guestPasses: { type: 'number', example: 2 },
            monthlyTrainerSessions: { type: 'number', example: 2 }
          }
        },
        member: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1-555-0123' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15' },
            membershipStartDate: { type: 'string', format: 'date', example: '2023-06-15' },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Jane Doe' },
                phone: { type: 'string', example: '+1-555-0456' },
                relationship: { type: 'string', example: 'spouse' }
              }
            }
          }
        },
        plan: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Premium Monthly' },
            description: { type: 'string', example: 'Full gym access with premium amenities' },
            duration: { type: 'number', example: 30 },
            durationUnit: { type: 'string', example: 'days', enum: ['days', 'months', 'years'] },
            benefits: {
              type: 'array',
              items: { type: 'string' },
              example: ['gym_access', 'group_classes', 'personal_trainer_2_sessions']
            },
            restrictions: {
              type: 'array',
              items: { type: 'string' },
              example: ['peak_hours_restriction']
            },
            isActive: { type: 'boolean', example: true }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view this subscription.' })
  @ApiResponse({ status: 404, description: 'Subscription not found or does not exist.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update a subscription',
    description: 'Updates subscription details including plan changes, billing information, auto-renewal settings, and member preferences. Handles plan upgrades/downgrades, payment method updates, and status modifications. Calculates prorations for mid-cycle changes.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the subscription to update',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        planName: { type: 'string', example: 'Premium Quarterly' },
        planType: { type: 'string', example: 'quarterly', enum: ['monthly', 'quarterly', 'yearly', 'lifetime'] },
        price: { type: 'number', example: 249.99 },
        currency: { type: 'string', example: 'USD' },
        billingCycle: { type: 'string', example: 'quarterly', enum: ['monthly', 'quarterly', 'yearly'] },
        startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-04-15T00:00:00.000Z' },
        nextBillingDate: { type: 'string', format: 'date-time', example: '2024-04-15T00:00:00.000Z' },
        status: { type: 'string', example: 'active', enum: ['active', 'cancelled', 'expired', 'suspended'] },
        autoRenew: { type: 'boolean', example: false },
        prorationAmount: { type: 'number', example: 45.50 },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          example: ['gym_access', 'group_classes', 'personal_trainer_4_sessions', 'nutrition_consultation']
        },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:00.000Z' },
        message: { type: 'string', example: 'Subscription updated successfully with prorated billing' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid update data provided or validation failed.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to update this subscription.' })
  @ApiResponse({ status: 404, description: 'Subscription not found or does not exist.' })
  @ApiBody({ 
    type: UpdateSubscriptionDto,
    description: 'Updated subscription data - include only fields that need to be changed',
    examples: {
      plan_upgrade: {
        summary: 'Upgrade to higher tier plan',
        value: {
          planId: 2,
          autoRenew: true,
          prorationType: 'full',
          effectiveDate: '2024-01-20T00:00:00.000Z'
        }
      },
      update_payment: {
        summary: 'Update payment method',
        value: {
          paymentMethodId: 'pm_0987654321',
          billingAddress: {
            street: '456 Oak Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'US'
          }
        }
      },
      change_billing: {
        summary: 'Change billing cycle',
        value: {
          billingCycle: 'yearly',
          autoRenew: false
        }
      }
    }
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete a subscription',
    description: 'Permanently removes a subscription from the system. This action cannot be undone and will revoke all associated member access. Only admins can delete subscriptions, and typically subscriptions are cancelled rather than deleted. Ensures all billing and access records are properly handled.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the subscription to delete',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Subscription deleted successfully' },
        deletedSubscription: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            memberId: { type: 'number', example: 123 },
            planName: { type: 'string', example: 'Premium Monthly' },
            startDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
            status: { type: 'string', example: 'deleted' },
            deletedAt: { type: 'string', format: 'date-time', example: '2024-01-20T09:15:00.000Z' },
            deletedBy: { type: 'number', example: 45 }
          }
        },
        accessRevoked: {
          type: 'object',
          properties: {
            gymAccess: { type: 'boolean', example: false },
            groupClasses: { type: 'boolean', example: false },
            personalTraining: { type: 'boolean', example: false },
            nutritionConsultation: { type: 'boolean', example: false },
            revokedAt: { type: 'string', format: 'date-time', example: '2024-01-20T09:15:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to delete subscriptions.' })
  @ApiResponse({ status: 404, description: 'Subscription not found or does not exist.' })
  @ApiResponse({ status: 409, description: 'Cannot delete subscription with active billing or pending payments.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.remove(id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cancel a subscription',
    description: 'Cancels an active subscription with specified cancellation timing (immediate or end of billing period). Handles refund calculations, access period management, and member notification. Preserves subscription history for analytics and compliance.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the subscription to cancel',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiBody({ 
    description: 'Cancellation details including timing and reason',
    schema: {
      type: 'object',
      properties: {
        cancellationType: {
          type: 'string',
          example: 'end_of_period',
          enum: ['immediate', 'end_of_period'],
          description: 'When to cancel the subscription'
        },
        reason: {
          type: 'string',
          example: 'relocating',
          enum: ['relocating', 'financial', 'dissatisfied', 'health_issues', 'other'],
          description: 'Reason for cancellation'
        },
        feedback: {
          type: 'string',
          example: 'Moving to another city for work',
          description: 'Additional feedback about cancellation'
        },
        refundAmount: {
          type: 'number',
          example: 45.50,
          description: 'Refund amount if applicable'
        },
        notifyMember: {
          type: 'boolean',
          example: true,
          description: 'Whether to send cancellation confirmation to member'
        }
      }
    },
    examples: {
      immediate_cancellation: {
        summary: 'Cancel immediately with refund',
        value: {
          cancellationType: 'immediate',
          reason: 'financial',
          feedback: 'Unable to continue due to job loss',
          refundAmount: 45.50,
          notifyMember: true
        }
      },
      end_of_period: {
        summary: 'Cancel at end of billing period',
        value: {
          cancellationType: 'end_of_period',
          reason: 'relocating',
          feedback: 'Moving to another city for work',
          notifyMember: true
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Subscription cancelled successfully' },
        subscription: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            status: { type: 'string', example: 'cancelled' },
            cancellationDate: { type: 'string', format: 'date-time', example: '2024-01-20T09:15:00.000Z' },
            endDate: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
            reason: { type: 'string', example: 'relocating' },
            refundAmount: { type: 'number', example: 0 },
            accessUntil: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' }
          }
        },
        accessChanges: {
          type: 'object',
          properties: {
            willRevokeAt: { type: 'string', format: 'date-time', example: '2024-02-15T00:00:00.000Z' },
            willRevokeAccess: { type: 'boolean', example: true }
          }
        },
        memberNotified: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid cancellation data provided or subscription cannot be cancelled.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to cancel subscriptions.' })
  @ApiResponse({ status: 404, description: 'Subscription not found or already cancelled.' })
  @ApiResponse({ status: 409, description: 'Cannot cancel subscription with pending payments or active promotional periods.' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.cancel(id);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get(':memberId/subscription')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: "Get a member's subscription",
    description: 'Retrieves the current active subscription for a specific member including plan details, billing information, access permissions, and membership status. Provides comprehensive view of the member subscription relationship.'
  })
  @ApiParam({ 
    name: 'memberId', 
    description: 'Unique identifier of the member',
    type: 'number',
    example: 123,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiQuery({ name: 'includeHistory', required: false, type: Boolean, description: 'Include subscription history and billing records', example: false })
  @ApiQuery({ name: 'includeBilling', required: false, type: Boolean, description: 'Include billing details and payment methods', example: true })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved member's subscription",
    schema: {
      type: 'object',
      properties: {
        memberId: { type: 'number', example: 123 },
        subscription: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            planName: { type: 'string', example: 'Premium Monthly' },
            planType: { type: 'string', example: 'monthly' },
            price: { type: 'number', example: 89.99 },
            currency: { type: 'string', example: 'USD' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            nextBillingDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', example: 'active' },
            autoRenew: { type: 'boolean', example: true },
            daysUntilExpiry: { type: 'number', example: 15 },
            benefits: {
              type: 'array',
              items: { type: 'string' },
              example: ['gym_access', 'group_classes', 'personal_trainer_2_sessions']
            },
            accessPermissions: {
              type: 'object',
              properties: {
                gymAccess: { type: 'boolean', example: true },
                groupClasses: { type: 'boolean', example: true },
                personalTraining: { type: 'boolean', example: true },
                nutritionConsultation: { type: 'boolean', example: true },
                guestPasses: { type: 'number', example: 2 }
              }
            }
          }
        },
        memberInfo: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1-555-0123' },
            membershipStartDate: { type: 'string', format: 'date', example: '2023-06-15' },
            membershipDuration: { type: 'number', example: 214 }
          }
        },
        billingInfo: {
          type: 'object',
          properties: {
            nextBillingAmount: { type: 'number', example: 89.99 },
            nextBillingDate: { type: 'string', format: 'date-time' },
            paymentMethod: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'credit_card' },
                lastFour: { type: 'string', example: '4242' },
                brand: { type: 'string', example: 'visa' }
              }
            },
            billingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' }
              }
            }
          }
        },
        subscriptionHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12340 },
              planName: { type: 'string', example: 'Basic Monthly' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              status: { type: 'string', example: 'completed' },
              price: { type: 'number', example: 49.99 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid member ID or query parameters.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view member subscription.' })
  @ApiResponse({ status: 404, description: 'Member not found or no active subscription exists.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.subscriptionsService.findByMember(memberId);
  }
}
