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
import { MealLibraryService } from './meal-library.service';
import { CreateMealLibraryDto } from './dto/create-meal-library.dto';
import { UpdateMealLibraryDto } from './dto/update-meal-library.dto';
import { FilterMealLibraryDto } from './dto/filter-meal-library.dto';

@ApiTags('meal-library')
@Controller('meal-library')
export class MealLibraryController {
  constructor(private readonly mealLibraryService: MealLibraryService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TRAINER)
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Meal with this name already exists',
  })
  create(@Body() createMealLibraryDto: CreateMealLibraryDto) {
    return this.mealLibraryService.create(createMealLibraryDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all meals with optional filters' })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully' })
  findAll(@Query() filterDto: FilterMealLibraryDto) {
    return this.mealLibraryService.findAll(filterDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a meal by ID' })
  @ApiParam({ name: 'id', description: 'Meal UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Meal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  findOne(@Param('id') id: string) {
    return this.mealLibraryService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TRAINER)
  @ApiOperation({ summary: 'Update a meal' })
  @ApiParam({ name: 'id', description: 'Meal UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  @ApiResponse({ status: 409, description: 'Meal name conflict' })
  update(
    @Param('id') id: string,
    @Body() updateMealLibraryDto: UpdateMealLibraryDto,
  ) {
    return this.mealLibraryService.update(id, updateMealLibraryDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TRAINER)
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiParam({ name: 'id', description: 'Meal UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  remove(@Param('id') id: string) {
    return this.mealLibraryService.remove(id);
  }
}
