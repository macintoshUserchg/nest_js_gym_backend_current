import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../entities/roles.entity';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieves all available roles in the system including system roles and custom roles. This endpoint is restricted to authenticated users and typically requires admin privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all roles.',
    type: [Role],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access roles.',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get role by ID',
    description:
      'Retrieves detailed information about a specific role by its unique identifier. Returns role details including name, description, and associated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the role.',
    examples: {
      success: {
        summary: 'Role details',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TRAINER',
          description:
            'Gym trainer with class management and member guidance permissions',
          users: [
            {
              userId: 456,
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found.',
    examples: {
      notFound: {
        summary: 'Role ID not found',
        value: {
          statusCode: 404,
          message:
            'Role with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access role details.',
  })
  findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'Creates a new custom role with specified permissions. Requires admin privileges.',
  })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
    type: Role,
  })
  @ApiResponse({
    status: 409,
    description: 'Role with this name already exists.',
  })
  create(@Body() createRoleDto: any) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a role',
    description:
      'Updates an existing role with new information. Requires admin privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
    type: Role,
  })
  update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Deletes a role permanently. Requires admin privileges. Cannot delete system roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Get('name/:name')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get role by name',
    description:
      'Retrieves role information by its exact name. This is useful for checking role permissions and user assignments. Common role names include SUPERADMIN, ADMIN, TRAINER, and MEMBER.',
  })
  @ApiParam({
    name: 'name',
    description: 'Role name (case-sensitive)',
    example: 'TRAINER',
    enum: ['SUPERADMIN', 'ADMIN', 'TRAINER', 'MEMBER'],
  })
  @ApiResponse({
    status: 200,
    description: 'Return the role with ID.',
    examples: {
      success: {
        summary: 'Role found by name',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TRAINER',
          description:
            'Gym trainer with class management and member guidance permissions',
          users: [
            {
              userId: 456,
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
            },
            {
              userId: 789,
              firstName: 'Mike',
              lastName: 'Johnson',
              email: 'mike.johnson@example.com',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found.',
    examples: {
      notFound: {
        summary: 'Role name not found',
        value: {
          statusCode: 404,
          message: 'Role with name CUSTOM_ROLE not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to access role details.',
  })
  findByName(@Param('name') name: string) {
    return this.rolesService.findByName(name);
  }
}
