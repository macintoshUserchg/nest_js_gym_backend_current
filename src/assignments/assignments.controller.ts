import {
  Controller,
  Get,
  Post,
  Body,
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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assign a member to a trainer' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully.' })
  @ApiResponse({ status: 404, description: 'Member or trainer not found.' })
  @ApiBody({ type: CreateAssignmentDto })
  create(@Body() createDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all assignments' })
  @ApiResponse({ status: 200, description: 'Return all assignments.' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Return the assignment.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}

@ApiTags('members')
@Controller('members')
export class MemberAssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':memberId/assignments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all trainer assignments for a member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Return all assignments for the member.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.assignmentsService.findByMember(memberId);
  }
}

@ApiTags('trainers')
@Controller('trainers')
export class TrainerAssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':trainerId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all members assigned to a trainer' })
  @ApiParam({ name: 'trainerId', description: 'Trainer ID' })
  @ApiResponse({ status: 200, description: 'Return all members for the trainer.' })
  @ApiResponse({ status: 404, description: 'Trainer not found.' })
  findByTrainer(@Param('trainerId', ParseIntPipe) trainerId: number) {
    return this.assignmentsService.findByTrainer(trainerId);
  }
}
