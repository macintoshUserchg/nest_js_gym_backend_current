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
  @ApiOperation({ summary: 'Mark attendance (check-in)' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiResponse({
    status: 404,
    description: 'Member, trainer, or branch not found.',
  })
  @ApiBody({ type: MarkAttendanceDto })
  markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Patch(':id/checkout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check out' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  @ApiResponse({ status: 200, description: 'Checked out successfully.' })
  @ApiResponse({ status: 400, description: 'Already checked out.' })
  @ApiResponse({ status: 404, description: 'Attendance record not found.' })
  checkOut(@Param('id') id: string) {
    return this.attendanceService.checkOut(id);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Return all attendance records.' })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  @ApiResponse({ status: 200, description: 'Return the attendance record.' })
  @ApiResponse({ status: 404, description: 'Attendance record not found.' })
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
  @ApiOperation({ summary: 'Get attendance records for a member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Return member attendance records.',
  })
  @ApiResponse({ status: 404, description: 'Member not found.' })
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
  @ApiOperation({ summary: 'Get attendance records for a trainer' })
  @ApiParam({ name: 'trainerId', description: 'Trainer ID' })
  @ApiResponse({
    status: 200,
    description: 'Return trainer attendance records.',
  })
  @ApiResponse({ status: 404, description: 'Trainer not found.' })
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
  @ApiOperation({ summary: 'Get attendance records for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({
    status: 200,
    description: 'Return branch attendance records.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.attendanceService.findByBranch(branchId);
  }
}
