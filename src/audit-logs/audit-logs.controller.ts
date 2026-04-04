import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { paginate } from '../common/dto/pagination.dto';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create an audit log entry',
    description:
      'Creates a new audit log entry to track system activities, user actions, and important events. This endpoint is typically used internally by the system to maintain a complete audit trail for compliance and security purposes.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Audit log created successfully - Activity has been recorded in the audit trail.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid audit log data - Check required fields, entity references, and action validity.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to create audit log entries.',
  })
  @ApiResponse({
    status: 404,
    description:
      'User not found - The specified user ID for the audit log does not exist.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while creating audit log entry.',
  })
  @ApiBody({
    type: CreateAuditLogDto,
    description: 'Audit log entry data',
    examples: {
      userAction: {
        summary: 'Log user authentication action',
        value: {
          userId: 'user-123e4567-e89b-12d3-a456-426614174000',
          action: 'LOGIN',
          entityType: 'user',
          entityId: 'user-123e4567-e89b-12d3-a456-426614174000',
          description: 'User successfully logged in',
          ipAddress: '192.168.1.100',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          metadata: {
            loginMethod: 'email',
            sessionId: 'sess-456e7890-e89b-12d3-a456-426614174001',
          },
        },
      },
      dataModification: {
        summary: 'Log data modification',
        value: {
          userId: 'user-789e1234-e89b-12d3-a456-426614174002',
          action: 'UPDATE',
          entityType: 'member',
          entityId: 'member-1001',
          description: 'Updated member profile information',
          ipAddress: '192.168.1.105',
          metadata: {
            fieldsChanged: ['phone', 'emergencyContact'],
            previousValues: {
              phone: '+1-555-0123',
              emergencyContact: 'Jane Doe',
            },
            newValues: {
              phone: '+1-555-0124',
              emergencyContact: 'John Smith',
            },
          },
        },
      },
    },
  })
  create(@Body() createDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all audit logs',
    description:
      'Retrieves all audit log entries across the system including user activities, system events, and data modifications. This endpoint provides a comprehensive view of system usage for compliance, security monitoring, and debugging purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'All audit logs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access audit logs. Only super admins can view comprehensive audit trails.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving audit logs.',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.auditLogsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get audit log by ID',
    description:
      'Retrieves detailed information about a specific audit log entry including the complete action details, user context, timestamps, and any associated metadata or change tracking information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the audit log entry',
    example: 'audit-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log entry retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access this audit log entry.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Audit log not found - The specified audit log ID does not exist.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving audit log entry.',
  })
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get audit logs by user',
    description:
      'Retrieves all audit log entries related to a specific user including their login activities, data modifications, and system interactions. Useful for user activity monitoring and security investigations.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier for the user',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access user audit logs.',
  })
  @ApiResponse({
    status: 404,
    description:
      'User not found - The specified user ID does not exist or no audit logs found for this user.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving user audit logs.',
  })
  findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get('entity/:entityType/:entityId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get audit logs by entity',
    description:
      'Retrieves all audit log entries related to a specific entity (such as a member, trainer, class, or membership plan) showing all modifications, access attempts, and related activities. Useful for tracking changes to specific records and compliance monitoring.',
  })
  @ApiParam({
    name: 'entityType',
    description:
      'Type of entity to audit (e.g., member, trainer, class, membership_plan, gym)',
    example: 'member',
    enum: [
      'member',
      'trainer',
      'class',
      'membership_plan',
      'gym',
      'branch',
      'user',
      'assignment',
      'attendance',
    ],
  })
  @ApiParam({
    name: 'entityId',
    description: 'Unique identifier for the specific entity',
    example: '1001',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 200,
    description: 'Entity audit logs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access entity audit logs.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Entity not found - No audit logs found for the specified entity type and ID combination.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while retrieving entity audit logs.',
  })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }

  @Get('action/:action')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get audit logs by action',
    description:
      'Retrieves all audit log entries for a specific type of action across the system (such as LOGIN, CREATE, UPDATE, DELETE, etc.). Useful for monitoring specific types of activities and identifying patterns or anomalies in system usage.',
  })
  @ApiParam({
    name: 'action',
    description:
      'Type of action to filter by (e.g., LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, APPROVE, REJECT)',
    example: 'LOGIN',
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE',
      'UPDATE',
      'DELETE',
      'VIEW',
      'APPROVE',
      'REJECT',
      'SUSPEND',
      'ACTIVATE',
      'PAYMENT',
      'REFUND',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Action-specific audit logs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to access action-specific audit logs.',
  })
  @ApiResponse({
    status: 404,
    description: 'No audit logs found for the specified action type.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error while retrieving action-specific audit logs.',
  })
  findByAction(@Param('action') action: string) {
    return this.auditLogsService.findByAction(action);
  }
}
