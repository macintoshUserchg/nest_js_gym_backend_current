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
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new trainer' })
  @ApiResponse({ status: 201, description: 'Trainer created successfully.' })
  @ApiResponse({ status: 409, description: 'Trainer with this email already exists.' })
  @ApiBody({ type: CreateTrainerDto })
  create(@Body() createDto: CreateTrainerDto) {
    return this.trainersService.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all trainers' })
  @ApiResponse({ status: 200, description: 'Return all trainers.' })
  findAll() {
    return this.trainersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a trainer by ID' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiResponse({ status: 200, description: 'Return the trainer.' })
  @ApiResponse({ status: 404, description: 'Trainer not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a trainer' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully.' })
  @ApiResponse({ status: 404, description: 'Trainer not found.' })
  @ApiResponse({ status: 409, description: 'Trainer with this email already exists.' })
  @ApiBody({ type: UpdateTrainerDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTrainerDto,
  ) {
    return this.trainersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a trainer' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiResponse({ status: 200, description: 'Trainer deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Trainer not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trainersService.remove(id);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchTrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get(':branchId/trainers')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all trainers for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({ status: 200, description: 'Return all trainers for the branch.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.trainersService.findByBranch(branchId);
  }
}
