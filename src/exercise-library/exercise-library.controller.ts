import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ExerciseLibraryService } from './exercise-library.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { FilterExerciseDto } from './dto/filter-exercise.dto';

@ApiTags('exercise-library')
@Controller('exercise-library')
export class ExerciseLibraryController {
  constructor(
    private readonly exerciseLibraryService: ExerciseLibraryService,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Exercise with this name already exists',
  })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exerciseLibraryService.create(createExerciseDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all exercises with optional filters' })
  @ApiResponse({ status: 200, description: 'Exercises retrieved successfully' })
  findAll(@Query() filterDto: FilterExerciseDto) {
    return this.exerciseLibraryService.findAll(filterDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get an exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Exercise retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  findOne(@Param('id') id: string) {
    return this.exerciseLibraryService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update an exercise' })
  @ApiParam({ name: 'id', description: 'Exercise UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 409, description: 'Exercise name conflict' })
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseLibraryService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Delete an exercise' })
  @ApiParam({ name: 'id', description: 'Exercise UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  remove(@Param('id') id: string) {
    return this.exerciseLibraryService.remove(id);
  }
}
