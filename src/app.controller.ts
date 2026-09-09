import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { AppService } from './app.service';

@ApiTags('application')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get application welcome message and status',
    description:
      'Returns a welcome message indicating that the Gym Management System API is running and accessible. This is the root endpoint that can be used to verify the API is operational and responding to requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hello World!',
        },
        api: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Gym Management System API',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            status: {
              type: 'string',
              example: 'operational',
              enum: ['operational', 'maintenance', 'down'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        endpoints: {
          type: 'array',
          description: 'Available API endpoint categories',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'members' },
              description: {
                type: 'string',
                example: 'Member management and profiles',
              },
              path: { type: 'string', example: '/members' },
            },
          },
          example: [
            {
              category: 'members',
              description: 'Member management and profiles',
              path: '/members',
            },
            {
              category: 'workouts',
              description: 'Workout plans and exercise routines',
              path: '/workouts',
            },
            {
              category: 'body-progress',
              description: 'Body measurements and progress tracking',
              path: '/body-progress',
            },
            {
              category: 'progress-tracking',
              description: 'Performance analytics and milestones',
              path: '/progress-tracking',
            },
            {
              category: 'subscriptions',
              description: 'Membership plans and billing',
              path: '/subscriptions',
            },
            {
              category: 'workout-logs',
              description: 'Training session records',
              path: '/workout-logs',
            },
            {
              category: 'analytics',
              description: 'Business intelligence and reports',
              path: '/analytics',
            },
          ],
        },
        documentation: {
          type: 'object',
          properties: {
            swagger: {
              type: 'string',
              example: '/api/docs',
            },
            health: {
              type: 'string',
              example: '/health',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error - Application encountered an unexpected error',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/live')
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Returns process-level liveness. Use this for container liveness probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application process is alive.',
  })
  getLiveHealth() {
    return {
      status: 'ok',
      check: 'liveness',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health/ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Checks service dependencies needed to serve traffic. Use this for load balancer readiness.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic.',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready to serve traffic.',
  })
  async getReadyHealth(@Res() res: Response) {
    let databaseReady = false;
    try {
      await this.dataSource.query('SELECT 1');
      databaseReady = true;
    } catch {
      databaseReady = false;
    }

    const payload = {
      status: databaseReady ? 'ready' : 'not_ready',
      check: 'readiness',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseReady ? 'ok' : 'error',
      },
    };

    if (!databaseReady) {
      return res.status(503).json(payload);
    }

    return res.json(payload);
  }

  @Get('health')
  @ApiOperation({
    summary: '[Legacy] Health check endpoint',
    description:
      'Backward-compatible health endpoint retained for Phase 1. Prefer /health/live and /health/ready for production probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          enum: ['ok', 'error', 'degraded'],
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        uptime: {
          type: 'number',
          description: 'Application uptime in seconds',
          example: 86400,
        },
        environment: {
          type: 'string',
          example: 'development',
          enum: ['development', 'staging', 'production'],
        },
        version: {
          type: 'string',
          example: '1.0.0',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description:
      'Service unavailable - Application is not responding or experiencing issues',
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('info')
  @ApiOperation({
    summary: 'Get API information and available endpoints',
    description:
      'Returns comprehensive information about the Gym Management System API including available endpoints, features, and quick links to documentation. Useful for API discovery and integration.',
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Gym Management System API',
        },
        description: {
          type: 'string',
          example:
            'Comprehensive REST API for gym and fitness center management including member tracking, workout planning, progress monitoring, and business analytics.',
        },
        version: {
          type: 'string',
          example: '1.0.0',
        },
        environment: {
          type: 'string',
          example: 'development',
          enum: ['development', 'staging', 'production'],
        },
        buildDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-10T08:00:00.000Z',
        },
        documentation: {
          type: 'object',
          properties: {
            swagger: {
              type: 'string',
              example: '/api/docs',
            },
            healthCheck: {
              type: 'string',
              example: '/health',
            },
          },
        },
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Member Management' },
              description: {
                type: 'string',
                example: 'Complete member registration and profile management',
              },
              endpoints: { type: 'number', example: 8 },
            },
          },
          example: [
            {
              name: 'Member Management',
              description:
                'Complete member registration and profile management',
              endpoints: 8,
            },
            {
              name: 'Workout Tracking',
              description:
                'Workout plans, exercise routines, and session logging',
              endpoints: 12,
            },
            {
              name: 'Progress Monitoring',
              description:
                'Body measurements, weight tracking, and progress photos',
              endpoints: 10,
            },
            {
              name: 'Subscription Management',
              description:
                'Membership plans, billing cycles, and payment tracking',
              endpoints: 6,
            },
            {
              name: 'Analytics & Reporting',
              description: 'Business intelligence and performance analytics',
              endpoints: 5,
            },
          ],
        },
        authentication: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              example: 'JWT Bearer Token',
            },
            header: {
              type: 'string',
              example: 'Authorization: Bearer <token>',
            },
            description: {
              type: 'string',
              example: 'Most endpoints require valid JWT authentication token',
            },
          },
        },
        support: {
          type: 'object',
          properties: {
            documentation: {
              type: 'string',
              example: 'Available at /api/docs endpoint',
            },
            contact: {
              type: 'string',
              example: 'API support through system administrators',
            },
          },
        },
      },
    },
  })
  getInfo() {
    return {
      name: 'Gym Management System API',
      description:
        'Comprehensive REST API for gym and fitness center management including member tracking, workout planning, progress monitoring, and business analytics.',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildDate: new Date().toISOString(),
      documentation: {
        swagger: '/api/docs',
        healthCheck: '/health',
      },
      features: [
        {
          name: 'Member Management',
          description: 'Complete member registration and profile management',
          endpoints: 8,
        },
        {
          name: 'Workout Tracking',
          description: 'Workout plans, exercise routines, and session logging',
          endpoints: 12,
        },
        {
          name: 'Progress Monitoring',
          description:
            'Body measurements, weight tracking, and progress photos',
          endpoints: 10,
        },
        {
          name: 'Subscription Management',
          description: 'Membership plans, billing cycles, and payment tracking',
          endpoints: 6,
        },
        {
          name: 'Analytics & Reporting',
          description: 'Business intelligence and performance analytics',
          endpoints: 5,
        },
      ],
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        description: 'Most endpoints require valid JWT authentication token',
      },
      support: {
        documentation: 'Available at /api/docs endpoint',
        contact: 'API support through system administrators',
      },
    };
  }
}
