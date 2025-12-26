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
  @ApiOperation({ 
    summary: 'Create a new body progress record',
    description: 'Records detailed body measurements and progress data for gym members including weight, body fat percentage, measurements, and progress photos. This endpoint allows trainers and gym staff to track member physical progress over time.'
  })
  @ApiResponse({
    status: 201,
    description: 'Body progress record created successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        memberId: { type: 'number', example: 123 },
        weight: { type: 'number', example: 75.5 },
        bodyFatPercentage: { type: 'number', example: 18.2 },
        muscleMass: { type: 'number', example: 32.1 },
        measurements: { type: 'object', example: { chest: 102, waist: 85, arms: 35 } },
        progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_2024_01_15.jpg' },
        notes: { type: 'string', example: 'Significant improvement in muscle definition' },
        recordedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        createdBy: { type: 'number', example: 45 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid body progress data provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to create progress records.' })
  @ApiResponse({ status: 404, description: 'Member not found or does not exist.' })
  @ApiResponse({ status: 409, description: 'Duplicate progress record for the same date.' })
  @ApiBody({ 
    type: CreateBodyProgressDto,
    description: 'Body progress data including measurements, weight, and optional progress photos',
    examples: {
      basic_entry: {
        summary: 'Basic body progress entry',
        value: {
          memberId: 123,
          weight: 75.5,
          bodyFatPercentage: 18.2,
          muscleMass: 32.1,
          measurements: {
            chest: 102,
            waist: 85,
            arms: 35,
            thighs: 55,
            hips: 95
          },
          notes: 'Significant improvement in muscle definition this month',
          recordedAt: '2024-01-15T10:30:00.000Z'
        }
      },
      with_photo: {
        summary: 'Progress entry with photo',
        value: {
          memberId: 123,
          weight: 73.2,
          bodyFatPercentage: 16.8,
          muscleMass: 33.5,
          measurements: {
            chest: 104,
            waist: 82,
            arms: 36
          },
          progressPhotoUrl: 'https://storage.example.com/progress/123_progress_2024_02_15.jpg',
          notes: 'Great progress! Weight loss of 2.3kg with maintained muscle mass',
          recordedAt: '2024-02-15T14:20:00.000Z'
        }
      }
    }
  })
  create(
    @Body() createBodyProgressDto: CreateBodyProgressDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bodyProgressService.create(createBodyProgressDto, user.userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get all body progress records',
    description: 'Retrieves comprehensive list of body progress records across all members. Supports filtering by date range, member, and pagination for large datasets. Requires admin or trainer permissions.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records per page (default: 20, max: 100)', example: 20 })
  @ApiQuery({ name: 'memberId', required: false, type: Number, description: 'Filter by specific member ID', example: 123 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter records from this date (ISO 8601 format)', example: '2024-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter records up to this date (ISO 8601 format)', example: '2024-12-31T23:59:59.999Z' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field (recordedAt, weight, createdAt)', example: 'recordedAt', enum: ['recordedAt', 'weight', 'createdAt', 'bodyFatPercentage'] })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, description: 'Sort order', example: 'desc', enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved body progress records',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              memberId: { type: 'number', example: 123 },
              weight: { type: 'number', example: 75.5 },
              bodyFatPercentage: { type: 'number', example: 18.2 },
              muscleMass: { type: 'number', example: 32.1 },
              measurements: { type: 'object', example: { chest: 102, waist: 85 } },
              progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_2024_01_15.jpg' },
              notes: { type: 'string', example: 'Great progress this month' },
              recordedAt: { type: 'string', format: 'date-time' },
              createdBy: { type: 'number', example: 45 },
              member: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' }
                }
              }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 5 },
            totalRecords: { type: 'number', example: 87 },
            recordsPerPage: { type: 'number', example: 20 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view progress records.' })
  findAll() {
    return this.bodyProgressService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get a body progress record by ID',
    description: 'Retrieves detailed information about a specific body progress record by its unique identifier. Includes complete member information and progress photos if available.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the body progress record',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved body progress record',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        weight: { type: 'number', example: 75.5 },
        bodyFatPercentage: { type: 'number', example: 18.2 },
        muscleMass: { type: 'number', example: 32.1 },
        waterPercentage: { type: 'number', example: 58.3 },
        boneMass: { type: 'number', example: 3.2 },
        measurements: {
          type: 'object',
          properties: {
            chest: { type: 'number', example: 102 },
            waist: { type: 'number', example: 85 },
            arms: { type: 'number', example: 35 },
            thighs: { type: 'number', example: 55 },
            hips: { type: 'number', example: 95 },
            shoulders: { type: 'number', example: 118 },
            neck: { type: 'number', example: 38 }
          }
        },
        progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_progress_2024_01_15.jpg' },
        beforePhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_before_2023_12_01.jpg' },
        notes: { type: 'string', example: 'Significant improvement in muscle definition. Member is very motivated.' },
        recordedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        createdBy: { type: 'number', example: 45 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        member: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1-555-0123' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15' },
            gender: { type: 'string', example: 'male', enum: ['male', 'female', 'other'] }
          }
        },
        createdByUser: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 45 },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            role: { type: 'string', example: 'trainer', enum: ['admin', 'trainer', 'staff'] }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid progress record ID provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view this progress record.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found or does not exist.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bodyProgressService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update a body progress record',
    description: 'Updates an existing body progress record with new measurements, photos, or notes. Only the creator of the record or users with appropriate permissions can modify the data. Useful for correcting measurement errors or adding follow-up notes.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the body progress record to update',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Body progress record updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 12345 },
        memberId: { type: 'number', example: 123 },
        weight: { type: 'number', example: 75.5 },
        bodyFatPercentage: { type: 'number', example: 18.2 },
        muscleMass: { type: 'number', example: 32.1 },
        measurements: { type: 'object', example: { chest: 102, waist: 85 } },
        progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_updated_2024_01_15.jpg' },
        notes: { type: 'string', example: 'Updated measurements - corrected waist measurement' },
        recordedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T14:20:00.000Z' },
        message: { type: 'string', example: 'Body progress record updated successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid update data provided or validation failed.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to update this progress record.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found or does not exist.' })
  @ApiBody({ 
    type: UpdateBodyProgressDto,
    description: 'Updated body progress data - only include fields that need to be updated',
    examples: {
      measurement_update: {
        summary: 'Update measurements only',
        value: {
          weight: 74.8,
          measurements: {
            chest: 103,
            waist: 84
          },
          notes: 'Member lost 0.7kg and reduced waist measurement by 1cm'
        }
      },
      add_photo: {
        summary: 'Add progress photo',
        value: {
          progressPhotoUrl: 'https://storage.example.com/progress/123_new_photo_2024_01_20.jpg',
          notes: 'New progress photo added showing significant muscle definition improvement'
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Delete a body progress record',
    description: 'Permanently removes a body progress record from the system. This action cannot be undone. Only admins, the record creator, or users with appropriate permissions can delete progress records. Progress photos will also be removed from storage.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the body progress record to delete',
    type: 'number',
    example: 12345,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Body progress record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Body progress record deleted successfully' },
        deletedRecord: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 12345 },
            memberId: { type: 'number', example: 123 },
            recordedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            deletedAt: { type: 'string', format: 'date-time', example: '2024-01-20T09:15:00.000Z' },
            deletedBy: { type: 'number', example: 45 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid progress record ID provided.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to delete this progress record.' })
  @ApiResponse({ status: 404, description: 'Body progress record not found or does not exist.' })
  @ApiResponse({ status: 409, description: 'Cannot delete record - it has associated dependent records.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bodyProgressService.remove(id, user.userId);
  }

  @Get('member/:memberId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get body progress records for a specific member',
    description: 'Retrieves all body progress records for a specific gym member, ordered chronologically from oldest to newest. Useful for tracking member progress over time and generating progress reports.'
  })
  @ApiParam({ 
    name: 'memberId', 
    description: 'Unique identifier of the member',
    type: 'number',
    example: 123,
    schema: { type: 'number', minimum: 1 }
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return (default: 50)', example: 20 })
  @ApiQuery({ name: 'includePhotos', required: false, type: Boolean, description: 'Whether to include progress photo URLs in response', example: true })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter records from this date (ISO 8601)', example: '2024-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter records up to this date (ISO 8601)', example: '2024-12-31T23:59:59.999Z' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member body progress records',
    schema: {
      type: 'object',
      properties: {
        memberId: { type: 'number', example: 123 },
        memberInfo: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' }
          }
        },
        progressRecords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 12345 },
              weight: { type: 'number', example: 75.5 },
              bodyFatPercentage: { type: 'number', example: 18.2 },
              muscleMass: { type: 'number', example: 32.1 },
              measurements: { type: 'object', example: { chest: 102, waist: 85 } },
              progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_2024_01_15.jpg' },
              notes: { type: 'string', example: 'Great progress this month' },
              recordedAt: { type: 'string', format: 'date-time' },
              createdBy: { type: 'number', example: 45 }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalRecords: { type: 'number', example: 12 },
            firstRecordDate: { type: 'string', format: 'date-time', example: '2023-06-15T10:30:00.000Z' },
            latestRecordDate: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            weightChange: { type: 'number', example: -5.2 },
            bodyFatChange: { type: 'number', example: -3.1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid member ID or query parameters.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view member progress records.' })
  @ApiResponse({ status: 404, description: 'Member not found or does not exist.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.bodyProgressService.findByMember(memberId);
  }

  @Get('user/my-body-progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get body progress records created by the current user',
    description: 'Retrieves all body progress records that were created by the currently authenticated user (trainer/staff). Useful for trainers to review their own measurement entries and track their assigned members progress.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Records per page (max 50)', example: 25 })
  @ApiQuery({ name: 'memberId', required: false, type: Number, description: 'Filter by specific member ID', example: 123 })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter records from this date', example: '2024-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter records up to this date', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved body progress records created by current user',
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
              member: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' }
                }
              },
              weight: { type: 'number', example: 75.5 },
              bodyFatPercentage: { type: 'number', example: 18.2 },
              muscleMass: { type: 'number', example: 32.1 },
              measurements: { type: 'object', example: { chest: 102, waist: 85 } },
              progressPhotoUrl: { type: 'string', example: 'https://storage.example.com/progress/123_2024_01_15.jpg' },
              notes: { type: 'string', example: 'Great progress this month' },
              recordedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 3 },
            totalRecords: { type: 'number', example: 67 },
            recordsPerPage: { type: 'number', example: 25 }
          }
        },
        stats: {
          type: 'object',
          properties: {
            totalRecordsCreated: { type: 'number', example: 67 },
            membersTracked: { type: 'number', example: 23 },
            recordsThisMonth: { type: 'number', example: 12 },
            lastRecordDate: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions to view created progress records.' })
  findByUser(@CurrentUser() user: UserEntity) {
    return this.bodyProgressService.findByUser(user.userId);
  }
}
