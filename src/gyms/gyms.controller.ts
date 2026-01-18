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
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { GymMemberResponseDto } from './dto/gym-member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Gym } from '../entities/gym.entity';

@ApiTags('gyms')
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  // ========== GYM ENDPOINTS ==========

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new gym',
    description:
      'Creates a new gym with basic information, logo, and location details',
  })
  @ApiResponse({
    status: 201,
    description: 'Gym created successfully.',
    type: Gym,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 409,
    description: 'Gym with this name already exists.',
  })
  @ApiBody({
    type: CreateGymDto,
    examples: {
      newGym: {
        summary: 'Create a new gym',
        value: {
          name: 'Fitness World Elite',
          address: '123 Main Street, Downtown',
          phone: '+1234567890',
          email: 'contact@fitnessworld.com',
          description: 'Premium fitness center with state-of-the-art equipment',
        },
      },
    },
  })
  create(@Body() createGymDto: CreateGymDto) {
    return this.gymsService.create(createGymDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all gyms',
    description:
      'Retrieve all gyms with optional filtering by location or search term',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter gyms by location/city',
    example: 'Los Angeles',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search gyms by name',
    example: 'FitZone',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all gyms.',
    type: [Gym],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  findAll(
    @Query('location') location?: string,
    @Query('search') search?: string,
  ) {
    return this.gymsService.findAll(location, search);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a gym by ID',
    description:
      'Retrieve detailed information about a specific gym including all branches',
  })
  @ApiParam({
    name: 'id',
    description: 'Gym ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the gym with branches.',
    type: Gym,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a gym',
    description:
      'Updates gym information such as name, address, contact details, or description. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gym ID',
    example: 'gym_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Gym updated successfully.',
    examples: {
      success: {
        summary: 'Gym updated successfully',
        value: {
          id: 'gym_1234567890abcdef',
          name: 'Updated Fitness World Elite',
          address: '456 New Street, Uptown',
          phone: '+1234567891',
          email: 'contact@updatedfitnessworld.com',
          description: 'Updated premium fitness center with new equipment',
          isActive: true,
          updatedAt: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    examples: {
      notFound: {
        summary: 'Gym ID not found',
        value: {
          statusCode: 404,
          message: 'Gym with ID gym_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateGymDto,
    examples: {
      updateContact: {
        summary: 'Update gym contact information',
        value: {
          phone: '+1234567891',
          email: 'newcontact@fitnessworld.com',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return this.gymsService.update(id, updateGymDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a gym',
    description:
      'Permanently deletes a gym and all its branches. Requires admin privileges. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Gym ID',
    example: 'gym_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Gym deleted successfully.',
    examples: {
      success: {
        summary: 'Gym deleted successfully',
        value: {
          message: 'Gym and all its branches have been successfully deleted',
          deletedGymId: 'gym_1234567890abcdef',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    examples: {
      notFound: {
        summary: 'Gym ID not found',
        value: {
          statusCode: 404,
          message: 'Gym with ID gym_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.gymsService.remove(id);
  }

  // ========== BRANCH ENDPOINTS ==========

  @Post(':gymId/branches')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a branch for a gym',
    description:
      'Creates a new branch for an existing gym with location details',
  })
  @ApiParam({
    name: 'gymId',
    description: 'Gym ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Check validation errors.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Branch with this name already exists in this gym.',
  })
  @ApiBody({
    type: CreateBranchDto,
    examples: {
      newBranch: {
        summary: 'Create a new gym branch',
        value: {
          name: 'Fitness World Elite - Downtown Branch',
          address: '789 Downtown Ave, Business District',
          phone: '+1234567892',
          email: 'downtown@fitnessworld.com',
          managerName: 'Jane Smith',
          openingHours: {
            monday: '06:00-22:00',
            tuesday: '06:00-22:00',
            wednesday: '06:00-22:00',
            thursday: '06:00-22:00',
            friday: '06:00-22:00',
            saturday: '07:00-20:00',
            sunday: '07:00-20:00',
          },
          facilities: [
            'Cardio Equipment',
            'Free Weights',
            'Group Classes',
            'Personal Training',
          ],
          coordinates: {
            latitude: 34.0522,
            longitude: -118.2437,
          },
        },
      },
    },
  })
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

  @Get(':gymId/members')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all members for a gym',
    description:
      'Retrieves all members from all branches of a specific gym with their profiles, ' +
      'subscription status, plan details, enrolled classes, and branch information. ' +
      'This endpoint is typically used by gym administrators to view and manage all members across all branches.',
  })
  @ApiParam({
    name: 'gymId',
    description: 'Gym ID (UUID format)',
    example: '29456119-2931-4bb5-a4d3-e239129fd21d',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by membership active status',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by specific branch ID (UUID)',
    example: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all members for the gym with their subscription and branch details.',
    type: [GymMemberResponseDto],
    examples: {
      success: {
        summary: 'List of gym members',
        value: [
          {
            id: 101,
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            gender: 'male',
            dateOfBirth: '1990-01-15',
            addressLine1: '123 Main Street',
            addressLine2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            avatarUrl: 'https://example.com/avatars/john.jpg',
            attachmentUrl: 'https://example.com/docs/john-id.pdf',
            emergencyContactName: 'Jane Doe',
            emergencyContactPhone: '9876543210',
            isActive: true,
            freezMember: false,
            createdAt: '2026-01-16T17:13:21.316Z',
            updatedAt: '2026-01-16T17:13:21.316Z',
            branchBranchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
            is_managed_by_member: true,
            subscription: {
              id: 101,
              plan: {
                id: 1,
                name: 'Elite Basic - Downtown',
                price: 8999,
                durationInDays: 30,
                description: 'Access to premium gym facilities and basic classes',
              },
              classes: [
                {
                  classId: '8cd45646-061b-4730-a2a5-1f400226564b',
                  name: 'Elite Morning Yoga',
                  description: 'Premium yoga session to start your day with mindfulness and strength',
                  timings: 'morning',
                  recurrenceType: 'weekly',
                  daysOfWeek: [1, 3, 5],
                },
                {
                  classId: '33ec8f27-0708-4808-958f-091301f8aa2c',
                  name: 'HIIT Elite Performance',
                  description: 'High-intensity interval training for elite athletes',
                  timings: 'evening',
                  recurrenceType: 'weekly',
                  daysOfWeek: [2, 4],
                },
              ],
              startDate: '2026-01-16T17:13:21.315Z',
              endDate: '2026-02-15T17:13:21.315Z',
              isActive: true,
            },
            branch: {
              branchId: 'a4a43bf7-e997-4716-839b-9f05a45f42be',
              name: 'Fitness First Elite - Downtown',
              email: 'downtown@fitnessfirstelite.com',
              phone: '+1-555-0101',
              address: '123 Elite Fitness Drive, Wellness City, WC 90210',
              location: 'Downtown',
              state: 'California',
              mainBranch: true,
              latitude: null,
              longitude: null,
              createdAt: '2026-01-15T17:28:12.198Z',
              updatedAt: '2026-01-15T17:28:12.198Z',
            },
          },
        ],
      },
      empty: {
        summary: 'No members found',
        value: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid gym ID format.',
    examples: {
      invalidUuid: {
        summary: 'Invalid UUID format',
        value: {
          statusCode: 400,
          message: 'Validation failed (uuid is expected)',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    examples: {
      missingToken: {
        summary: 'No authentication token provided',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
      invalidToken: {
        summary: 'Invalid JWT token',
        value: {
          statusCode: 401,
          message: 'Invalid token',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to access this gym\'s members.',
  })
  @ApiResponse({
    status: 404,
    description: 'Gym not found.',
    examples: {
      notFound: {
        summary: 'Gym ID not found',
        value: {
          statusCode: 404,
          message: 'Gym with ID 123e4567-e89b-12d3-a456-426614174000 not found',
          error: 'Not Found',
        },
      },
    },
  })
  findMembers(@Param('gymId') gymId: string) {
    return this.gymsService.findMembersByGym(gymId);
  }

  @Get(':gymId/trainers')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all trainers for a gym' })
  @ApiParam({ name: 'gymId', description: 'Gym ID' })
  @ApiResponse({ status: 200, description: 'Return all trainers for the gym.' })
  @ApiResponse({ status: 404, description: 'Gym not found.' })
  findTrainers(@Param('gymId') gymId: string) {
    return this.gymsService.findTrainersByGym(gymId);
  }
}

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all branches',
    description:
      'Retrieves all gym branches across all gyms in the system. Requires admin privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all branches.',
    examples: {
      success: {
        summary: 'List of all branches',
        value: [
          {
            id: 'branch_1234567890abcdef',
            name: 'Fitness World Elite - Downtown',
            address: '789 Downtown Ave, Business District',
            phone: '+1234567892',
            email: 'downtown@fitnessworld.com',
            gym: {
              id: 'gym_1234567890abcdef',
              name: 'Fitness World Elite',
            },
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    },
  })
  async findAll() {
    // This will get all branches across all gyms
    const gyms = await this.gymsService.findAll();
    const branches = gyms.flatMap((gym) => gym.branches || []);
    return branches;
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a branch by ID',
    description:
      'Retrieves detailed information about a specific gym branch including location, facilities, and contact details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'branch_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the branch.',
    examples: {
      success: {
        summary: 'Branch details',
        value: {
          id: 'branch_1234567890abcdef',
          name: 'Fitness World Elite - Downtown',
          address: '789 Downtown Ave, Business District',
          phone: '+1234567892',
          email: 'downtown@fitnessworld.com',
          managerName: 'Jane Smith',
          openingHours: {
            monday: '06:00-22:00',
            tuesday: '06:00-22:00',
            wednesday: '06:00-22:00',
            thursday: '06:00-22:00',
            friday: '06:00-22:00',
            saturday: '07:00-20:00',
            sunday: '07:00-20:00',
          },
          facilities: [
            'Cardio Equipment',
            'Free Weights',
            'Group Classes',
            'Personal Training',
          ],
          gym: {
            id: 'gym_1234567890abcdef',
            name: 'Fitness World Elite',
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID branch_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOneBranch(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a branch',
    description:
      'Updates branch information such as contact details, opening hours, or facilities. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'branch_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully.',
    examples: {
      success: {
        summary: 'Branch updated successfully',
        value: {
          id: 'branch_1234567890abcdef',
          name: 'Fitness World Elite - Updated Downtown',
          address: '789 Downtown Ave, Business District',
          phone: '+1234567893',
          email: 'updated@downtownfitnessworld.com',
          managerName: 'Jane Smith',
          openingHours: {
            monday: '05:00-23:00',
            tuesday: '05:00-23:00',
            wednesday: '05:00-23:00',
            thursday: '05:00-23:00',
            friday: '05:00-23:00',
            saturday: '06:00-21:00',
            sunday: '06:00-21:00',
          },
          facilities: [
            'Cardio Equipment',
            'Free Weights',
            'Group Classes',
            'Personal Training',
            'Swimming Pool',
          ],
          isActive: true,
          updatedAt: '2024-01-02T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID branch_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateBranchDto,
    examples: {
      updateHours: {
        summary: 'Update branch opening hours',
        value: {
          openingHours: {
            monday: '05:00-23:00',
            tuesday: '05:00-23:00',
            wednesday: '05:00-23:00',
            thursday: '05:00-23:00',
            friday: '05:00-23:00',
            saturday: '06:00-21:00',
            sunday: '06:00-21:00',
          },
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.gymsService.updateBranch(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a branch',
    description:
      'Permanently deletes a gym branch. Requires admin privileges. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'branch_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch deleted successfully.',
    examples: {
      success: {
        summary: 'Branch deleted successfully',
        value: {
          message: 'Branch has been successfully deleted',
          deletedBranchId: 'branch_1234567890abcdef',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID branch_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.gymsService.removeBranch(id);
  }

  @Get(':branchId/trainers')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all trainers for a specific branch',
    description:
      'Retrieves all trainers assigned to a specific gym branch with their details and specializations.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'branch_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all trainers for the branch.',
    examples: {
      success: {
        summary: 'List of branch trainers',
        value: [
          {
            id: 1,
            fullName: 'Trainer Marcus Sterling',
            email: 'trainer.marcus.sterling@fitnessfirstelite.com',
            phone: '+1-555-2000',
            specialization: 'Elite Strength Training, Powerlifting',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            branch: {
              branchId: 'dc33cf0d-763b-44af-bdd8-21427357df1b',
              name: 'Fitness First Elite - Downtown',
              location: 'Downtown',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found.',
    examples: {
      notFound: {
        summary: 'Branch ID not found',
        value: {
          statusCode: 404,
          message: 'Branch with ID branch_1234567890abcdef not found',
          error: 'Not Found',
        },
      },
    },
  })
  findBranchTrainers(@Param('branchId') branchId: string) {
    return this.gymsService.findTrainersByBranch(branchId);
  }
}
