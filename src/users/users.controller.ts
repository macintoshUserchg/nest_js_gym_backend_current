import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enums/permissions.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user account with the provided details. Requires admin privileges.',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
    examples: {
      duplicateEmail: {
        summary: 'Email already exists',
        value: {
          statusCode: 409,
          message: 'User with this email already exists',
          error: 'Conflict',
        },
      },
    },
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      admin: {
        summary: 'Create admin user',
        value: {
          email: 'admin@gym.com',
          password: 'AdminPass123!',
          roleId: 'role_admin_123',
          firstName: 'John',
          lastName: 'Admin',
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a list of all users in the system. Requires admin privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    examples: {
      success: {
        summary: 'List of all users',
        value: [
          {
            userId: 'usr_1234567890abcdef',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: { id: 'role_member_123', name: 'MEMBER' },
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Changes the password for the currently authenticated user. Requires the current password for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully changed.',
    examples: {
      success: {
        summary: 'Password changed successfully',
        value: {
          message: 'Password changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password.',
    examples: {
      invalidPassword: {
        summary: 'Current password is incorrect',
        value: {
          statusCode: 400,
          message: 'Current password is incorrect',
          error: 'Bad Request',
        },
      },
    },
  })
  async changePassword(
    @Request() req,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return current user profile.',
    examples: {
      success: {
        summary: 'Current user profile',
        value: {
          userId: 'usr_1234567890abcdef',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: { id: 'role_member_123', name: 'MEMBER' },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Retrieves a specific user by their unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'usr_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    examples: {
      success: {
        summary: 'User found',
        value: {
          userId: 'usr_1234567890abcdef',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: { id: 'role_member_123', name: 'MEMBER' },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    examples: {
      notFound: {
        summary: 'User ID not found',
        value: {
          statusCode: 404,
          message: 'User with ID usr_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates an existing user with new information. Requires admin privileges or self-update.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'usr_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    examples: {
      success: {
        summary: 'User updated successfully',
        value: {
          userId: 'usr_1234567890abcdef',
          email: 'updated@example.com',
          firstName: 'John',
          lastName: 'Updated',
          role: { id: 'role_member_123', name: 'MEMBER' },
          isActive: true,
          updatedAt: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    examples: {
      notFound: {
        summary: 'User ID not found',
        value: {
          statusCode: 404,
          message: 'User with ID usr_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateEmail: {
        summary: 'Update user email',
        value: {
          email: 'newemail@example.com',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Deletes a user account permanently. Requires admin privileges. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'usr_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    examples: {
      success: {
        summary: 'User deleted successfully',
        value: {
          message: 'User has been successfully deleted',
          deletedUserId: 'usr_1234567890abcdef',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    examples: {
      notFound: {
        summary: 'User ID not found',
        value: {
          statusCode: 404,
          message: 'User with ID usr_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
