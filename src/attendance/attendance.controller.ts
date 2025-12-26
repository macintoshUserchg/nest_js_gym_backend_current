import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Mark attendance (check-in)',
    description: 'Records a check-in for members or trainers at the gym or for specific classes. This endpoint supports both general gym visits and class-specific attendance tracking with automatic capacity management.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Attendance marked successfully - Check-in recorded.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request - Member already checked in, class is full, or invalid attendance type.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to mark attendance.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member, trainer, class, or branch not found - Check that all referenced entities exist.',
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Duplicate attendance - Member is already checked in or class is at full capacity.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while marking attendance.' 
  })
  @ApiBody({ 
    type: MarkAttendanceDto,
    description: 'Attendance check-in data',
    examples: {
      gymVisit: {
        summary: 'General gym visit check-in',
        value: {
          memberId: 1001,
          attendanceType: 'gym_visit',
          checkInTime: '2025-12-26T09:00:00Z',
          branchId: 'branch-123e4567-e89b-12d3-a456-426614174000',
          notes: 'Morning workout session'
        }
      },
      classAttendance: {
        summary: 'Class attendance check-in',
        value: {
          memberId: 1002,
          classId: 'cls-456e7890-e89b-12d3-a456-426614174001',
          attendanceType: 'class',
          checkInTime: '2025-12-26T18:00:00Z',
          branchId: 'branch-123e4567-e89b-12d3-a456-426614174000'
        }
      },
      trainerCheckIn: {
        summary: 'Trainer arrival check-in',
        value: {
          trainerId: 101,
          attendanceType: 'trainer_arrival',
          checkInTime: '2025-12-26T08:45:00Z',
          branchId: 'branch-123e4567-e89b-12d3-a456-426614174000',
          scheduledClassId: 'cls-456e7890-e89b-12d3-a456-426614174001'
        }
      }
    }
  })
  markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Patch(':id/checkout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Check out',
    description: 'Records the check-out time for a member or trainer. Calculates duration and updates attendance records with session completion details. Supports both gym visits and class sessions.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier for the attendance record to check out',
    example: 'att-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Checked out successfully - Session duration calculated and recorded.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Already checked out - This attendance record has already been completed, or invalid check-out time.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to check out this attendance record.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Attendance record not found - The specified attendance ID does not exist or has been removed.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while processing check-out.' 
  })
  checkOut(@Param('id') id: string) {
    return this.attendanceService.checkOut(id);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get all attendance records',
    description: 'Retrieves all attendance records across the system including check-in/out times, session durations, and attendance types. Useful for administrators to monitor gym usage and generate attendance reports.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All attendance records retrieved successfully.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to access attendance data.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while retrieving attendance records.' 
  })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get attendance record by ID',
    description: 'Retrieves detailed information about a specific attendance record including check-in/out times, session duration, member/trainer details, and any notes or feedback recorded during the session.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier for the attendance record',
    example: 'att-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Attendance record retrieved successfully.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to access this attendance record.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Attendance record not found - The specified attendance ID does not exist.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while retrieving attendance record.' 
  })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':memberId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get attendance records for a member',
    description: 'Retrieves all attendance records for a specific member including gym visits, class attendance, and trainer sessions. Useful for members to track their workout history and for trainers to monitor member consistency.'
  })
  @ApiParam({ 
    name: 'memberId', 
    description: 'Unique identifier for the member',
    example: 1001,
    schema: { type: 'integer', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Member attendance records retrieved successfully.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to access member attendance records.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Member not found - The specified member ID does not exist or you do not have access to view their records.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while retrieving member attendance.' 
  })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.attendanceService.findByMember(memberId);
  }
}

@ApiTags('trainers')
@Controller('trainers')
export class TrainerAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':trainerId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get attendance records for a trainer',
    description: 'Retrieves all attendance records for a specific trainer including arrival times, class sessions, and work hours tracking. Useful for trainers to monitor their schedule compliance and for administrators to track trainer punctuality.'
  })
  @ApiParam({ 
    name: 'trainerId', 
    description: 'Unique identifier for the trainer',
    example: 101,
    schema: { type: 'integer', minimum: 1 }
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer attendance records retrieved successfully.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to access trainer attendance records.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Trainer not found - The specified trainer ID does not exist or you do not have access to view their records.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while retrieving trainer attendance.' 
  })
  findByTrainer(@Param('trainerId', ParseIntPipe) trainerId: number) {
    return this.attendanceService.findByTrainer(trainerId);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':branchId/attendance')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get attendance records for a branch',
    description: 'Retrieves all attendance records for a specific branch including member visits, trainer arrivals, and class attendance. Useful for branch managers to monitor facility usage, peak hours, and staff performance.'
  })
  @ApiParam({ 
    name: 'branchId', 
    description: 'Unique identifier for the branch',
    example: 'branch-123e4567-e89b-12d3-a456-426614174000',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiResponse({
    status: 200,
    description: 'Branch attendance records retrieved successfully.',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token.' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions to access branch attendance records.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Branch not found - The specified branch ID does not exist or you do not have access to view its records.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while retrieving branch attendance.' 
  })
  findByBranch(@Param('branchId') branchId: string) {
    return this.attendanceService.findByBranch(branchId);
  }
}
