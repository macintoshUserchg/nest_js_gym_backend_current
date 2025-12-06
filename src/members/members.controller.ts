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
} from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Member with this email already exists.',
  })
  @ApiBody({ type: CreateMemberDto })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all members' })
  @ApiResponse({ status: 200, description: 'Return all members.' })
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a member by ID' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Return the member.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a member' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member updated successfully.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  @ApiResponse({
    status: 409,
    description: 'Member with this email already exists.',
  })
  @ApiBody({ type: UpdateMemberDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }

  @Get(':memberId/dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get member dashboard data' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Return member dashboard data.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  getMemberDashboard(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.membersService.getMemberDashboard(memberId);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchMembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':branchId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all members for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all members for the branch.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.membersService.findByBranch(branchId);
  }
}
