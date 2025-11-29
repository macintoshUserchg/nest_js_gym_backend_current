import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gyms')
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  // ========== GYM ENDPOINTS ==========

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new gym' })
  @ApiResponse({ status: 201, description: 'Gym created successfully.' })
  @ApiBody({ type: CreateGymDto })
  create(@Body() createGymDto: CreateGymDto) {
    return this.gymsService.create(createGymDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all gyms' })
  @ApiResponse({ status: 200, description: 'Return all gyms.' })
  findAll() {
    return this.gymsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a gym by ID' })
  @ApiParam({ name: 'id', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return the gym.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a gym' })
  @ApiParam({ name: 'id', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Gym updated successfully.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  @ApiBody({ type: UpdateGymDto })
  update(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return this.gymsService.update(id, updateGymDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a gym' })
  @ApiParam({ name: 'id', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Gym deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  remove(@Param('id') id: string) {
    return this.gymsService.remove(id);
  }

  // ========== BRANCH ENDPOINTS ==========

  @Post(':gymId/branches')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a branch for a gym' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 201, description: 'Branch created successfully.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  @ApiBody({ type: CreateBranchDto })
  createBranch(
    @Param('gymId') gymId: string,
    @Body() createBranchDto: CreateBranchDto,
  ) {
    return this.gymsService.createBranch(gymId, createBranchDto);
  }

  @Get(':gymId/branches')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all branches for a gym' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return all branches for the gym.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  findBranches(@Param('gymId') gymId: string) {
    return this.gymsService.findBranchesByGym(gymId);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'Return all branches.' })
  async findAll() {
    // This will get all branches across all gyms
    const gyms = await this.gymsService.findAll();
    const branches = gyms.flatMap((gym) => gym.branches || []);
    return branches;
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return the branch.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOneBranch(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a branch' })
  @ApiParam({ name: 'id', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  @ApiBody({ type: UpdateBranchDto })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.gymsService.updateBranch(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a branch' })
  @ApiParam({ name: 'id', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  remove(@Param('id') id: string) {
    return this.gymsService.removeBranch(id);
  }
}
