# Comprehensive Swagger Documentation Analysis Report

## Overview
This report analyzes **23 controller files** in the NestJS gym application to identify missing Swagger documentation elements. The analysis covers missing decorators, incomplete documentation, and provides copy-paste ready fixes.

## Summary of Findings

### Files Analyzed:
- ✅ `src/auth/auth.controller.ts`
- ✅ `src/users/users.controller.ts`
- ✅ `src/gyms/gyms.controller.ts`
- ✅ `src/members/members.controller.ts`
- ✅ `src/membership-plans/membership-plans.controller.ts`
- ✅ `src/classes/classes.controller.ts`
- ✅ `src/trainers/trainers.controller.ts`
- ✅ `src/assignments/assignments.controller.ts`
- ✅ `src/attendance/attendance.controller.ts`
- ✅ `src/audit-logs/audit-logs.controller.ts`
- ✅ `src/analytics/analytics.controller.ts`
- ✅ `src/roles/roles.controller.ts`
- ✅ `src/invoices/invoices.controller.ts`
- ✅ `src/payments/payments.controller.ts`
- ✅ `src/goals/goals.controller.ts`
- ✅ `src/diet-plans/diet-plans.controller.ts`
- ✅ `src/body-progress/body-progress.controller.ts`
- ✅ `src/inquiries/inquiries.controller.ts`
- ✅ `src/app.controller.ts` - **NEWLY ANALYZED**
- ✅ `src/progress-tracking/progress-tracking.controller.ts` - **NEWLY ANALYZED**
- ✅ `src/subscriptions/subscriptions.controller.ts` - **NEWLY ANALYZED**
- ✅ `src/workout-logs/workout-logs.controller.ts` - **NEWLY ANALYZED**
- ✅ `src/workouts/workouts.controller.ts` - **NEWLY ANALYZED**
- ❌ `src/exercise-library/exercise-library.controller.ts` - NO CONTROLLER FILE EXISTS

## Common Missing Elements Across All Controllers

### 1. Missing @ApiBearerAuth() Decorators
**Issue**: Protected endpoints missing authentication documentation
**Impact**: API consumers won't know authentication is required

### 2. Incomplete @ApiOperation() Decorators
**Issue**: Only `summary` provided, missing `description` field
**Impact**: Limited documentation context for API consumers

### 3. Missing @ApiParam() Examples
**Issue**: Parameter descriptions lack example values
**Impact**: Users don't know expected parameter format

### 4. Incomplete @ApiResponse() Decorators
**Issue**: Missing type definitions and example schemas
**Impact**: Unclear response structure for API consumers

### 5. Missing @ApiBody() Examples
**Issue**: Request body examples not provided
**Impact**: Users don't know request format requirements

### 6. Missing @ApiQuery() for Complex Endpoints
**Issue**: GET endpoints with query parameters lack proper documentation
**Impact**: Query parameter requirements unclear

### 7. Missing Response DTO Examples
**Issue**: Response types not properly defined with examples
**Impact**: API response structure unclear

---

## Detailed Analysis by Controller

### 1. src/auth/auth.controller.ts

**File Path**: `src/auth/auth.controller.ts`
**Line Numbers**: 1-53

**Missing Elements**:
1. **@ApiBearerAuth() decorators** (Lines 19-48)
   - Both login and logout endpoints should have `@ApiBearerAuth('JWT-auth')`

2. **Enhanced @ApiOperation() descriptions** (Lines 21, 46)
   - Missing `description` field in both endpoints

3. **@ApiResponse() examples** (Lines 22-27)
   - Missing example values for successful responses
   - Missing error response schemas

**Copy-Paste Fix**:
```typescript
@HttpCode(HttpStatus.OK)
@ApiBearerAuth('JWT-auth')
@Post('login')
@ApiOperation({ 
  summary: 'User login',
  description: 'Authenticate user with email and password. Returns JWT token for subsequent API calls.'
})
@ApiResponse({
  status: 200,
  description: 'User logged in successfully.',
  type: LoginResponseDto,
  examples: {
    success: {
      value: {
        userid: 'usr_1234567890abcdef',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMTIzNDU2Nzg5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE2MzM4MzA2MDAsImV4cCI6MTYzMzgzNDIwMH0.example_signature'
      }
    }
  }
})
@ApiResponse({ 
  status: 401, 
  description: 'Invalid credentials.',
  examples: {
    invalidCredentials: {
      value: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized'
      }
    }
  }
})
@ApiBody({ 
  type: LoginUserDto,
  examples: {
    valid: {
      value: {
        email: 'member@example.com',
        password: 'SecurePassword123!'
      }
    }
  }
})
async login(@Body() loginDto: LoginUserDto): Promise<LoginResponseDto> {
  // ... existing code
}

@HttpCode(HttpStatus.OK)
@ApiBearerAuth('JWT-auth')
@Post('logout')
@ApiOperation({ 
  summary: 'User logout',
  description: 'Logout user and invalidate JWT token. Client should discard the token after successful logout.'
})
@ApiResponse({ 
  status: 200, 
  description: 'User logged out successfully.',
  examples: {
    success: {
      value: {
        message: 'Logged out successfully. Please discard your token.'
      }
    }
  }
})
async logout() {
  // ... existing code
}
```

### 2. src/users/users.controller.ts

**File Path**: `src/users/users.controller.ts`
**Line Numbers**: 1-101

**Missing Elements**:
1. **@ApiBearerAuth() decorator** (Line 30)
   - Create endpoint missing authentication decorator

2. **Enhanced @ApiOperation() descriptions** (Lines 31, 48, 57, 66, 77, 91)
   - All endpoints missing `description` field

3. **@ApiResponse() type definitions** (Lines 32-39, 49, 58, 68-69, 79-83, 93-97)
   - Missing return types and examples

4. **@ApiParam() examples** (Lines 67, 78, 92)
   - Missing example values for ID parameters

**Copy-Paste Fix**:
```typescript
@Post()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'Create a new user',
  description: 'Creates a new user account with the provided details. Requires admin privileges.'
})
@ApiResponse({
  status: 201,
  description: 'The user has been successfully created.',
  type: CreateUserResponseDto,
})
@ApiResponse({
  status: 409,
  description: 'User with this email already exists.',
  examples: {
    duplicateEmail: {
      value: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict'
      }
    }
  }
})
@ApiBody({ 
  type: CreateUserDto,
  examples: {
    admin: {
      value: {
        email: 'admin@gym.com',
        password: 'AdminPass123!',
        roleId: 'role_admin_123',
        firstName: 'John',
        lastName: 'Admin'
      }
    }
  }
)
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get()
@ApiOperation({ 
  summary: 'Get all users',
  description: 'Retrieves a list of all users in the system. Requires admin privileges.'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return all users.',
  type: [UserResponseDto],
  examples: {
    success: {
      value: [
        {
          userId: 'usr_1234567890abcdef',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: { id: 'role_member_123', name: 'MEMBER' },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  }
})
findAll() {
  return this.usersService.findAll();
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('profile')
@ApiOperation({ 
  summary: 'Get current user profile',
  description: 'Retrieves the profile information of the currently authenticated user.'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return current user profile.',
  type: UserProfileDto,
  examples: {
    success: {
      value: {
        userId: 'usr_1234567890abcdef',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 'role_member_123', name: 'MEMBER' },
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  }
})
getProfile(@Request() req) {
  return this.usersService.findById(req.user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a user by ID',
  description: 'Retrieves a specific user by their unique identifier.'
})
@ApiParam({ 
  name: 'id', 
  description: 'User ID',
  example: 'usr_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the user.',
  type: UserResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'User not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'User with ID usr_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id') id: string) {
  return this.usersService.findById(id);
}

// Continue with similar improvements for update() and remove() methods...
```

### 3. src/gyms/gyms.controller.ts

**File Path**: `src/gyms/gyms.controller.ts`
**Line Numbers**: 1-176

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** (All endpoints)
2. **@ApiResponse() type definitions and examples** (All endpoints)
3. **@ApiParam() examples** (Lines 56, 67, 79, 92, 107, 118, 147, 158, 170)
4. **@ApiBody() examples** (Lines 38, 70, 95, 161)

**Copy-Paste Fix for Gym Endpoints**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new gym',
  description: 'Creates a new gym location. Requires admin privileges. The gym will be associated with the current user\'s organization.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Gym created successfully.',
  type: GymResponseDto
})
@ApiBody({ 
  type: CreateGymDto,
  examples: {
    newGym: {
      value: {
        name: 'Fitness World Elite',
        address: '123 Main Street, Downtown',
        phone: '+1234567890',
        email: 'contact@fitnessworld.com',
        description: 'Premium fitness center with state-of-the-art equipment'
      }
    }
  }
})
create(@Body() createGymDto: CreateGymDto) {
  return this.gymsService.create(createGymDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a gym by ID',
  description: 'Retrieves detailed information about a specific gym including its branches and statistics.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Gym ID',
  example: 'gym_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the gym.',
  type: GymDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Gym not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Gym with ID gym_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id') id: string) {
  return this.gymsService.findOne(id);
}

// Similar improvements for all other endpoints...
```

### 4. src/members/members.controller.ts

**File Path**: `src/members/members.controller.ts`
**Line Numbers**: 1-124

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new member',
  description: 'Registers a new gym member with personal details and membership information.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Member created successfully.',
  type: MemberResponseDto
})
@ApiResponse({
  status: 409,
  description: 'Member with this email already exists.',
  examples: {
    duplicateEmail: {
      value: {
        statusCode: 409,
        message: 'Member with this email already exists',
        error: 'Conflict'
      }
    }
  }
})
@ApiBody({ 
  type: CreateMemberDto,
  examples: {
    newMember: {
      value: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        address: '123 Main St, City, State',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+0987654321',
          relationship: 'Spouse'
        },
        membershipPlanId: 1,
        branchId: 'branch_123'
      }
    }
  }
})
create(@Body() createMemberDto: CreateMemberDto) {
  return this.membersService.create(createMemberDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a member by ID',
  description: 'Retrieves detailed information about a specific member including membership status and recent activity.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Member ID',
  example: 123
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the member.',
  type: MemberDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.membersService.findOne(id);
}
```

### 5. src/membership-plans/membership-plans.controller.ts

**File Path**: `src/membership-plans/membership-plans.controller.ts`
**Line Numbers**: 1-105

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new membership plan',
  description: 'Creates a new membership plan with pricing and features. Used by gym administrators to define membership options.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Plan created successfully.',
  type: MembershipPlanResponseDto
})
@ApiBody({ 
  type: CreateMembershipPlanDto,
  examples: {
    monthlyPlan: {
      value: {
        name: 'Monthly Premium',
        description: 'Access to all gym facilities for one month',
        duration: 30,
        durationUnit: 'days',
        price: 79.99,
        currency: 'USD',
        features: ['All Equipment', 'Group Classes', 'Personal Trainer 1 session/month'],
        isActive: true,
        branchId: 'branch_123'
      }
    }
  }
})
create(@Body() createDto: CreateMembershipPlanDto) {
  return this.plansService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a membership plan by ID',
  description: 'Retrieves detailed information about a specific membership plan including current subscribers.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Plan ID',
  example: 1
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the plan.',
  type: MembershipPlanDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Plan not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Membership plan with ID 1 not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.plansService.findOne(id);
}
```

### 6. src/classes/classes.controller.ts

**File Path**: `src/classes/classes.controller.ts`
**Line Numbers**: 1-142

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new class',
  description: 'Creates a new fitness class/session that members can enroll in. Includes scheduling and capacity information.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Class created successfully.',
  type: ClassResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Branch not found.' 
})
@ApiBody({ 
  type: CreateClassDto,
  examples: {
    yogaClass: {
      value: {
        name: 'Morning Yoga',
        description: 'Relaxing yoga session for all levels',
        category: 'yoga',
        trainerId: 456,
        branchId: 'branch_123',
        maxCapacity: 20,
        duration: 60,
        schedule: {
          dayOfWeek: 1,
          startTime: '07:00',
          endTime: '08:00'
        },
        isActive: true
      }
    }
  }
})
create(@Body() createDto: CreateClassDto) {
  return this.classesService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a class by ID',
  description: 'Retrieves detailed information about a specific fitness class including enrolled members and schedule.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Class ID',
  example: 'class_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the class.',
  type: ClassDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Class not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Class with ID class_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id') id: string) {
  return this.classesService.findOne(id);
}
```

### 7. src/trainers/trainers.controller.ts

**File Path**: `src/trainers/trainers.controller.ts`
**Line Numbers**: 1-113

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new trainer',
  description: 'Registers a new trainer with their specializations and contact information. Trainers can be assigned to specific branches.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Trainer created successfully.',
  type: TrainerResponseDto
})
@ApiResponse({
  status: 409,
  description: 'Trainer with this email already exists.',
  examples: {
    duplicateEmail: {
      value: {
        statusCode: 409,
        message: 'Trainer with this email already exists',
        error: 'Conflict'
      }
    }
  }
})
@ApiBody({ 
  type: CreateTrainerDto,
  examples: {
    newTrainer: {
      value: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@gym.com',
        phone: '+1234567890',
        specializations: ['Personal Training', 'Weight Training', 'Cardio'],
        experience: 5,
        certifications: ['ACE Certified Personal Trainer', 'CPR Certified'],
        branchId: 'branch_123',
        bio: 'Experienced trainer with 5+ years in fitness industry'
      }
    }
  }
})
create(@Body() createDto: CreateTrainerDto) {
  return this.trainersService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a trainer by ID',
  description: 'Retrieves detailed information about a specific trainer including their schedule and assigned members.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Trainer ID',
  example: 123
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the trainer.',
  type: TrainerDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Trainer not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Trainer with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.trainersService.findOne(id);
}
```

### 8. src/assignments/assignments.controller.ts

**File Path**: `src/assignments/assignments.controller.ts`
**Line Numbers**: 1-109

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Assign a member to a trainer',
  description: 'Creates a training assignment between a member and trainer. This establishes their professional relationship for personal training sessions.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Assignment created successfully.',
  type: AssignmentResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Member or trainer not found.',
  examples: {
    memberNotFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    },
    trainerNotFound: {
      value: {
        statusCode: 404,
        message: 'Trainer with ID 456 not found',
        error: 'Not Found'
      }
    }
  }
})
@ApiBody({ 
  type: CreateAssignmentDto,
  examples: {
    newAssignment: {
      value: {
        memberId: 123,
        trainerId: 456,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        sessionFrequency: 2,
        notes: 'Focus on weight loss and strength building'
      }
    }
  }
})
create(@Body() createDto: CreateAssignmentDto) {
  return this.assignmentsService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get an assignment by ID',
  description: 'Retrieves detailed information about a specific trainer-member assignment including session history.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Assignment ID',
  example: 'assignment_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the assignment.',
  type: AssignmentDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Assignment not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Assignment with ID assignment_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id') id: string) {
  return this.assignmentsService.findOne(id);
}
```

### 9. src/attendance/attendance.controller.ts

**File Path**: `src/attendance/attendance.controller.ts`
**Line Numbers**: 1-134

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Mark attendance (check-in)',
  description: 'Records a check-in for a member or trainer at a gym branch. Includes location verification and timestamp.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Attendance marked successfully.',
  type: AttendanceResponseDto
})
@ApiResponse({ 
  status: 400, 
  description: 'Invalid request.',
  examples: {
    invalidCheckin: {
      value: {
        statusCode: 400,
        message: 'Invalid check-in request: User already checked in',
        error: 'Bad Request'
      }
    }
  }
})
@ApiResponse({
  status: 404,
  description: 'Member, trainer, or branch not found.',
  examples: {
    memberNotFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
@ApiBody({ 
  type: MarkAttendanceDto,
  examples: {
    memberCheckin: {
      value: {
        userType: 'member',
        userId: 123,
        branchId: 'branch_123',
        checkInTime: '2024-01-01T09:00:00Z',
        location: 'Main Entrance'
      }
    }
  }
})
markAttendance(@Body() dto: MarkAttendanceDto) {
  return this.attendanceService.markAttendance(dto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Patch(':id/checkout')
@ApiOperation({ 
  summary: 'Check out',
  description: 'Records a check-out for an active attendance session. Calculates duration and updates status.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Attendance ID',
  example: 'attendance_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Checked out successfully.',
  examples: {
    success: {
      value: {
        id: 'attendance_1234567890abcdef',
        userId: 123,
        branchId: 'branch_123',
        checkInTime: '2024-01-01T09:00:00Z',
        checkOutTime: '2024-01-01T11:30:00Z',
        duration: 150,
        status: 'completed'
      }
    }
  }
})
@ApiResponse({ 
  status: 400, 
  description: 'Already checked out.',
  examples: {
    alreadyCheckedOut: {
      value: {
        statusCode: 400,
        message: 'Attendance record already has check-out time',
        error: 'Bad Request'
      }
    }
  }
})
checkOut(@Param('id') id: string) {
  return this.attendanceService.checkOut(id);
}
```

### 10. src/audit-logs/audit-logs.controller.ts

**File Path**: `src/audit-logs/audit-logs.controller.ts`
**Line Numbers**: 1-84

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create an audit log entry',
  description: 'Records a system audit trail entry for tracking user actions and system changes. Typically used internally by the application.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Audit log created successfully.',
  type: AuditLogResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'User not found.' 
})
@ApiBody({ 
  type: CreateAuditLogDto,
  examples: {
    userAction: {
      value: {
        userId: 'usr_1234567890abcdef',
        action: 'UPDATE_MEMBER',
        entityType: 'member',
        entityId: '123',
        changes: {
          phone: {
            from: '+1234567890',
            to: '+0987654321'
          }
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  }
})
create(@Body() createDto: CreateAuditLogDto) {
  return this.auditLogsService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get audit log by ID',
  description: 'Retrieves a specific audit log entry by its unique identifier.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Audit log ID',
  example: 'audit_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the audit log.',
  type: AuditLogDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Audit log not found.' 
})
findOne(@Param('id') id: string) {
  return this.auditLogsService.findOne(id);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('entity/:entityType/:entityId')
@ApiOperation({ 
  summary: 'Get audit logs by entity',
  description: 'Retrieves all audit log entries related to a specific entity (e.g., member, trainer, gym).'
})
@ApiParam({ 
  name: 'entityType', 
  description: 'Entity type (e.g., member, trainer, gym, class)',
  example: 'member'
})
@ApiParam({ 
  name: 'entityId', 
  description: 'Entity ID',
  example: '123'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return entity audit logs.',
  type: [AuditLogDetailDto]
})
findByEntity(
  @Param('entityType') entityType: string,
  @Param('entityId') entityId: string,
) {
  return this.auditLogsService.findByEntity(entityType, entityId);
}
```

### 11. src/analytics/analytics.controller.ts

**File Path**: `src/analytics/analytics.controller.ts`
**Line Numbers**: 1-533

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** - This controller already has extensive documentation but could benefit from more detailed descriptions
2. **@ApiParam() examples** - Already has good examples
3. **@ApiResponse() schemas** - Already has detailed schemas with examples

**Status**: ✅ Well documented, minor improvements possible

### 12. src/roles/roles.controller.ts

**File Path**: `src/roles/roles.controller.ts`
**Line Numbers**: 1-50

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get()
@ApiOperation({ 
  summary: 'Get all roles',
  description: 'Retrieves a list of all available user roles in the system (e.g., SUPERADMIN, ADMIN, TRAINER, MEMBER).'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return all roles.',
  type: [RoleResponseDto],
  examples: {
    success: {
      value: [
        {
          id: 'role_superadmin_123',
          name: 'SUPERADMIN',
          description: 'Full system access',
          permissions: ['*'],
          isActive: true
        },
        {
          id: 'role_admin_456',
          name: 'ADMIN',
          description: 'Gym administration access',
          permissions: ['gym:read', 'gym:write', 'member:read', 'member:write'],
          isActive: true
        }
      ]
    }
  }
})
findAll() {
  return this.rolesService.findAll();
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get role by ID',
  description: 'Retrieves detailed information about a specific role including its permissions and assigned users.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Role ID',
  example: 'role_admin_456'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the role.',
  type: RoleDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Role not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Role with ID role_admin_456 not found',
        error: 'Not Found'
      }
    }
  }
})
findById(@Param('id') id: string) {
  return this.rolesService.findById(id);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('name/:name')
@ApiOperation({ 
  summary: 'Get role by name',
  description: 'Retrieves a role by its name identifier. Common role names include SUPERADMIN, ADMIN, TRAINER, and MEMBER.'
})
@ApiParam({
  name: 'name',
  description: 'Role name (e.g., SUPERADMIN, ADMIN, TRAINER, MEMBER)',
  example: 'ADMIN'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the role with ID.',
  type: RoleResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Role not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Role with name ADMIN not found',
        error: 'Not Found'
      }
    }
  }
})
findByName(@Param('name') name: string) {
  return this.rolesService.findByName(name);
}
```

### 13. src/invoices/invoices.controller.ts

**File Path**: `src/invoices/invoices.controller.ts`
**Line Numbers**: 1-102

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create invoice',
  description: 'Generates a new invoice for member services such as membership fees, personal training sessions, or other gym services.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Invoice created successfully.',
  type: InvoiceResponseDto
})
@ApiResponse({
  status: 404,
  description: 'Member or subscription not found.',
  examples: {
    memberNotFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
@ApiBody({ 
  type: CreateInvoiceDto,
  examples: {
    membershipInvoice: {
      value: {
        memberId: 123,
        subscriptionId: 'sub_1234567890',
        invoiceNumber: 'INV-2024-001',
        dueDate: '2024-02-01',
        items: [
          {
            description: 'Monthly Membership - January 2024',
            quantity: 1,
            unitPrice: 79.99,
            total: 79.99
          }
        ],
        subtotal: 79.99,
        tax: 6.40,
        total: 86.39,
        notes: 'Thank you for your business!'
      }
    }
  }
})
create(@Body() createDto: CreateInvoiceDto) {
  return this.invoicesService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiOperation({ 
  summary: 'Update invoice',
  description: 'Updates invoice details such as due date, items, or payment status. Only pending or overdue invoices can be modified.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Invoice ID',
  example: 'invoice_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Invoice updated successfully.',
  type: InvoiceResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Invoice not found.' 
})
@ApiBody({ 
  type: UpdateInvoiceDto,
  examples: {
    updateDueDate: {
      value: {
        dueDate: '2024-02-15',
        notes: 'Extended payment terms'
      }
    }
  }
})
update(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
  return this.invoicesService.update(id, updateDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post(':id/cancel')
@ApiOperation({ 
  summary: 'Cancel invoice',
  description: 'Cancels an invoice that has not been paid. Cancelled invoices cannot be reinstated.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Invoice ID',
  example: 'invoice_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Invoice cancelled successfully.',
  examples: {
    success: {
      value: {
        id: 'invoice_1234567890abcdef',
        status: 'cancelled',
        cancelledAt: '2024-01-01T10:00:00Z',
        message: 'Invoice cancelled successfully'
      }
    }
  }
})
@ApiResponse({ 
  status: 404, 
  description: 'Invoice not found.' 
})
cancelInvoice(@Param('id') id: string) {
  return this.invoicesService.cancelInvoice(id);
}
```

### 14. src/payments/payments.controller.ts

**File Path**: `src/payments/payments.controller.ts`
**Line Numbers**: 1-92

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Record payment',
  description: 'Records a payment for an invoice. Supports multiple payment methods including cash, credit/debit cards, and bank transfers.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Payment recorded successfully.',
  type: PaymentResponseDto
})
@ApiResponse({ 
  status: 400, 
  description: 'Invalid payment.',
  examples: {
    overPayment: {
      value: {
        statusCode: 400,
        message: 'Payment amount exceeds invoice total',
        error: 'Bad Request'
      }
    }
  }
})
@ApiResponse({ 
  status: 404, 
  description: 'Invoice not found.',
  examples: {
    invoiceNotFound: {
      value: {
        statusCode: 404,
        message: 'Invoice with ID invoice_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
@ApiBody({ 
  type: CreatePaymentDto,
  examples: {
    cardPayment: {
      value: {
        invoiceId: 'invoice_1234567890abcdef',
        amount: 86.39,
        paymentMethod: 'credit_card',
        paymentDate: '2024-01-15',
        transactionId: 'txn_9876543210fedcba',
        reference: 'Payment for INV-2024-001',
        notes: 'Paid via online portal',
        processedBy: 'usr_1234567890abcdef'
      }
    }
  }
})
create(@Body() createDto: CreatePaymentDto) {
  return this.paymentsService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get payment by ID',
  description: 'Retrieves detailed information about a specific payment transaction.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Payment ID',
  example: 'payment_1234567890abcdef'
})
@ApiResponse({ 
  status: 200, 
  description: 'Return the payment.',
  type: PaymentDetailDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Payment not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Payment with ID payment_1234567890abcdef not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id') id: string) {
  return this.paymentsService.findOne(id);
}
```

### 15. src/goals/goals.controller.ts

**File Path**: `src/goals/goals.controller.ts`
**Line Numbers**: 1-125

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new goal',
  description: 'Creates a fitness goal for a member. Goals can be created by trainers or administrators and assigned to specific members.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Goal created successfully.',
  type: GoalResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateGoalDto,
  examples: {
    weightLossGoal: {
      value: {
        memberId: 123,
        title: 'Lose 10 pounds',
        description: 'Achieve target weight through diet and exercise',
        category: 'weight_loss',
        targetValue: 10,
        targetUnit: 'lbs',
        targetDate: '2024-06-01',
        priority: 'high',
        status: 'active',
        notes: 'Focus on cardio 3x per week and balanced diet'
      }
    }
  }
})
create(
  @Body() createGoalDto: CreateGoalDto,
  @CurrentUser() user: UserEntity,
) {
  return this.goalsService.create(createGoalDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiOperation({ 
  summary: 'Update a goal',
  description: 'Updates an existing goal. Can modify target values, deadlines, status, or add progress notes.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Goal ID',
  example: 123
})
@ApiResponse({ 
  status: 200, 
  description: 'Goal updated successfully.',
  type: GoalResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Goal not found.' 
})
@ApiBody({ 
  type: UpdateGoalDto,
  examples: {
    updateProgress: {
      value: {
        progress: 5,
        notes: 'Lost 5 pounds so far, on track to meet target',
        status: 'in_progress'
      }
    }
  }
})
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateGoalDto: UpdateGoalDto,
  @CurrentUser() user: UserEntity,
) {
  return this.goalsService.update(id, updateGoalDto, user.userId);
}
```

### 16. src/diet-plans/diet-plans.controller.ts

**File Path**: `src/diet-plans/diet-plans.controller.ts`
**Line Numbers**: 1-128

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new diet plan',
  description: 'Creates a personalized diet plan for a member. Plans can include meal recommendations, nutritional guidelines, and dietary restrictions.'
})
@ApiResponse({ 
  status: 201, 
  description: 'Diet plan created successfully.',
  type: DietPlanResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateDietDto,
  examples: {
    weightLossPlan: {
      value: {
        memberId: 123,
        title: 'Weight Loss Diet Plan',
        description: 'Calorie-controlled diet for healthy weight loss',
        duration: 30,
        durationUnit: 'days',
        dailyCalories: 1500,
        meals: [
          {
            name: 'Breakfast',
            foods: ['Oatmeal with berries', 'Almond milk', 'Greek yogurt'],
            calories: 400
          },
          {
            name: 'Lunch',
            foods: ['Grilled chicken salad', 'Quinoa', 'Mixed vegetables'],
            calories: 500
          }
        ],
        restrictions: ['No processed foods', 'Limit sugar intake'],
        notes: 'Focus on whole foods and stay hydrated'
      }
    }
  }
})
create(
  @Body() createDietDto: CreateDietDto,
  @CurrentUser() user: UserEntity,
) {
  return this.dietPlansService.create(createDietDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiOperation({ 
  summary: 'Update a diet plan',
  description: 'Updates an existing diet plan. Can modify meals, calories, restrictions, or duration.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Diet plan ID',
  example: 123
})
@ApiResponse({ 
  status: 200, 
  description: 'Diet plan updated successfully.',
  type: DietPlanResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Diet plan not found.' 
})
@ApiBody({ 
  type: UpdateDietDto,
  examples: {
    updateCalories: {
      value: {
        dailyCalories: 1600,
        notes: 'Increased calories based on member feedback'
      }
    }
  }
})
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateDietDto: UpdateDietDto,
  @CurrentUser() user: UserEntity,
) {
  return this.dietPlansService.update(id, updateDietDto, user.userId);
}
```

### 17. src/body-progress/body-progress.controller.ts

**File Path**: `src/body-progress/body-progress.controller.ts`
**Line Numbers**: 1-146

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions**
2. **@ApiResponse() type definitions and examples**
3. **@ApiParam() examples**
4. **@ApiBody() examples**

**Copy-Paste Fix**:
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post()
@ApiOperation({ 
  summary: 'Create a new body progress record',
  description: 'Records body measurement and progress data for a member. Used to track fitness journey and goal achievement.'
})
@ApiResponse({
  status: 201,
  description: 'Body progress record created successfully.',
  type: BodyProgressResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateBodyProgressDto,
  examples: {
    monthlyProgress: {
      value: {
        memberId: 123,
        measurementDate: '2024-01-01',
        weight: 165.5,
        height: 70,
        bodyFat: 18.2,
        muscleMass: 125.8,
        measurements: {
          chest: 40.5,
          waist: 32.0,
          hips: 38.5,
          arms: 13.2,
          thighs: 22.1
        },
        photos: {
          front: 'progress_photo_front_123.jpg',
          side: 'progress_photo_side_123.jpg',
          back: 'progress_photo_back_123.jpg'
        },
        notes: 'Great progress this month! Weight is trending down'
      }
    }
  }
})
create(
  @Body() createBodyProgressDto: CreateBodyProgressDto,
  @CurrentUser() user: UserEntity,
) {
  return this.bodyProgressService.create(createBodyProgressDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiOperation({ 
  summary: 'Update a body progress record',
  description: 'Updates an existing body progress record. Typically used to correct measurements or add notes.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Body progress record ID',
  example: 123
})
@ApiResponse({
  status: 200,
  description: 'Body progress record updated successfully.',
  type: BodyProgressResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Body progress record not found.' 
})
@ApiBody({ 
  type: UpdateBodyProgressDto,
  examples: {
    addNote: {
      value: {
        notes: 'Corrected weight measurement - scale was not calibrated properly'
      }
    }
  }
})
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateBodyProgressDto: UpdateBodyProgressDto,
  @CurrentUser() user: UserEntity,
) {
  return this.bodyProgressService.update(
    id,
    updateBodyProgressDto,
    user.userId,
  );
}
```

### 18. src/inquiries/inquiries.controller.ts

**File Path**: `src/inquiries/inquiries.controller.ts`
**Line Numbers**: 1-257

**Missing Elements**:
1. **@ApiBearerAuth() decorators** for protected endpoints
2. **Enhanced @ApiOperation() descriptions** for some endpoints
3. **@ApiResponse() type definitions** for some endpoints

**Status**: ✅ Well documented, minor improvements needed

**Copy-Paste Fix**:
```typescript
@Post()
@ApiOperation({ 
  summary: 'Create a new inquiry',
  description: 'Creates a new customer inquiry from potential members. This is a public endpoint for lead generation and customer acquisition.'
})
@ApiBody({ 
  type: CreateInquiryDto,
  examples: {
    newInquiry: {
      value: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        source: 'website',
        branchId: 'branch_123',
        message: 'Interested in membership plans and facility tour',
        preferredContactMethod: 'email'
      }
    }
  }
})
@ApiResponse({
  status: 201,
  description: 'Inquiry created successfully',
  type: InquiryResponseDto,
})
@ApiResponse({
  status: 409,
  description: 'Inquiry with this email already exists',
  examples: {
    duplicateEmail: {
      value: {
        statusCode: 409,
        message: 'An inquiry with this email already exists',
        error: 'Conflict'
      }
    }
  }
})
async create(@Body() createInquiryDto: CreateInquiryDto) {
  return this.inquiriesService.create(createInquiryDto);
}

// Add @ApiBearerAuth() to protected endpoints
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get()
@ApiOperation({ 
  summary: 'Get all inquiries with filtering and pagination',
  description: 'Retrieves inquiries with advanced filtering options. Requires admin or staff privileges to access.'
})
// ... rest of the code
```

### 19. src/app.controller.ts

**File Path**: `src/app.controller.ts`
**Line Numbers**: 1-12

**Missing Elements**:
1. **@ApiOperation() decorator** missing completely
2. **@ApiTags() decorator** missing
3. **@ApiResponse() decorators** missing
4. **General Swagger documentation** completely absent

**Status**: ❌ Minimal documentation, major improvements needed

**Copy-Paste Fix**:
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Returns a simple greeting message to verify the API is running. This is a public endpoint that does not require authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'API is running successfully',
    examples: {
      success: {
        value: 'Hello World!'
      }
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### 20. src/progress-tracking/progress-tracking.controller.ts

**File Path**: `src/progress-tracking/progress-tracking.controller.ts`
**Line Numbers**: 1-162

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** - All endpoints missing `description` field
2. **@ApiResponse() type definitions and examples** - Missing return types and examples
3. **@ApiParam() examples** - Missing example values for ID parameters
4. **@ApiBody() examples** - Missing request body examples

**Status**: ⚠️ Well structured with authentication, needs detailed documentation

**Copy-Paste Fix**:
```typescript
@Post()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'Create a new progress tracking record',
  description: 'Creates a detailed progress tracking record for a member. Includes measurements, goals, and tracking metrics to monitor fitness journey progress.'
})
@ApiResponse({
  status: 201,
  description: 'Progress tracking record created successfully.',
  type: ProgressTrackingResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden - insufficient permissions.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateProgressDto,
  examples: {
    weightProgress: {
      value: {
        memberId: 123,
        trackingType: 'weight',
        value: 165.5,
        unit: 'lbs',
        measurementDate: '2024-01-01',
        notes: 'Monthly weight check-in',
        createdBy: 'usr_1234567890abcdef'
      }
    }
  }
})
create(
  @Body() createProgressDto: CreateProgressDto,
  @CurrentUser() user: UserEntity,
) {
  return this.progressTrackingService.create(createProgressDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get(':id')
@ApiOperation({ 
  summary: 'Get a progress tracking record by ID',
  description: 'Retrieves detailed information about a specific progress tracking record including all measurements and notes.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Progress tracking record ID',
  example: 123
})
@ApiResponse({
  status: 200,
  description: 'Return the progress tracking record.',
  type: ProgressTrackingDetailDto
})
@ApiResponse({
  status: 404,
  description: 'Progress tracking record not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Progress tracking record with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.progressTrackingService.findOne(id.toString());
}

// Continue with similar improvements for all other endpoints...
```

### 21. src/subscriptions/subscriptions.controller.ts

**File Path**: `src/subscriptions/subscriptions.controller.ts`
**Line Numbers**: 1-136

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** - All endpoints missing `description` field
2. **@ApiResponse() type definitions and examples** - Missing return types and examples
3. **@ApiParam() examples** - Missing example values for ID parameters
4. **@ApiBody() examples** - Missing request body examples

**Status**: ⚠️ Well structured with authentication, needs detailed documentation

**Copy-Paste Fix**:
```typescript
@Post()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'Assign a member to a membership plan',
  description: 'Creates a new subscription linking a member to a specific membership plan. Handles billing cycles, payment status, and plan activation.'
})
@ApiResponse({
  status: 201,
  description: 'Subscription created successfully.',
  type: SubscriptionResponseDto
})
@ApiResponse({ 
  status: 404, 
  description: 'Member or membership plan not found.',
  examples: {
    memberNotFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    },
    planNotFound: {
      value: {
        statusCode: 404,
        message: 'Membership plan with ID 1 not found',
        error: 'Not Found'
      }
    }
  }
})
@ApiResponse({
  status: 409,
  description: 'Member already has an active subscription.',
  examples: {
    activeSubscription: {
      value: {
        statusCode: 409,
        message: 'Member already has an active subscription',
        error: 'Conflict'
      }
    }
  }
})
@ApiBody({ 
  type: CreateSubscriptionDto,
  examples: {
    newSubscription: {
      value: {
        memberId: 123,
        membershipPlanId: 1,
        startDate: '2024-01-01',
        billingCycle: 'monthly',
        paymentMethod: 'credit_card',
        autoRenew: true,
        notes: 'VIP membership upgrade'
      }
    }
  }
})
create(@Body() createDto: CreateSubscriptionDto) {
  return this.subscriptionsService.create(createDto);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Post(':id/cancel')
@ApiOperation({ 
  summary: 'Cancel a subscription',
  description: 'Cancels an active subscription. Sets end date to current date and marks subscription as cancelled. Does not process refunds automatically.'
})
@ApiParam({ 
  name: 'id', 
  description: 'Subscription ID',
  example: 456
})
@ApiResponse({
  status: 200,
  description: 'Subscription cancelled successfully.',
  examples: {
    success: {
      value: {
        id: 456,
        memberId: 123,
        status: 'cancelled',
        cancelledAt: '2024-01-15T10:00:00Z',
        message: 'Subscription cancelled successfully'
      }
    }
  }
})
@ApiResponse({ 
  status: 404, 
  description: 'Subscription not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Subscription with ID 456 not found',
        error: 'Not Found'
      }
    }
  }
})
cancel(@Param('id', ParseIntPipe) id: number) {
  return this.subscriptionsService.cancel(id);
}
```

### 22. src/workout-logs/workout-logs.controller.ts

**File Path**: `src/workout-logs/workout-logs.controller.ts`
**Line Numbers**: 1-137

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** - All endpoints missing `description` field
2. **@ApiResponse() type definitions and examples** - Missing return types and examples
3. **@ApiParam() examples** - Missing example values for ID parameters
4. **@ApiBody() examples** - Missing request body examples

**Status**: ⚠️ Well structured with authentication, needs detailed documentation

**Copy-Paste Fix**:
```typescript
@Post()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'Create a new workout log',
  description: 'Records a completed workout session with exercises, sets, reps, and other performance metrics. Used for tracking workout history and progress.'
})
@ApiResponse({
  status: 201,
  description: 'Workout log created successfully.',
  type: WorkoutLogResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden - insufficient permissions.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateWorkoutLogDto,
  examples: {
    completedWorkout: {
      value: {
        memberId: 123,
        workoutDate: '2024-01-01',
        duration: 90,
        exercises: [
          {
            exerciseName: 'Bench Press',
            sets: 3,
            reps: 12,
            weight: 135,
            weightUnit: 'lbs',
            notes: 'Felt strong today'
          },
          {
            exerciseName: 'Squats',
            sets: 4,
            reps: 10,
            weight: 185,
            weightUnit: 'lbs',
            notes: 'Good form maintained'
          }
        ],
        overallNotes: 'Great workout session, felt energized',
        createdBy: 'usr_1234567890abcdef'
      }
    }
  }
})
create(
  @Body() createWorkoutLogDto: CreateWorkoutLogDto,
  @CurrentUser() user: UserEntity,
) {
  return this.workoutLogsService.create(createWorkoutLogDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('member/:memberId')
@ApiOperation({ 
  summary: 'Get workout logs for a specific member',
  description: 'Retrieves all workout logs for a specific member with optional filtering by date range and workout type.'
})
@ApiParam({ 
  name: 'memberId', 
  description: 'Member ID',
  example: 123
})
@ApiResponse({
  status: 200,
  description: 'Return workout logs for the member.',
  type: [WorkoutLogDetailDto]
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
  return this.workoutLogsService.findByMember(memberId);
}
```

### 23. src/workouts/workouts.controller.ts

**File Path**: `src/workouts/workouts.controller.ts`
**Line Numbers**: 1-136

**Missing Elements**:
1. **Enhanced @ApiOperation() descriptions** - All endpoints missing `description` field
2. **@ApiResponse() type definitions and examples** - Missing return types and examples
3. **@ApiParam() examples** - Missing example values for ID parameters
4. **@ApiBody() examples** - Missing request body examples

**Status**: ⚠️ Well structured with authentication, needs detailed documentation

**Copy-Paste Fix**:
```typescript
@Post()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'Create a new workout plan',
  description: 'Creates a structured workout plan for a member with specific exercises, sets, reps, and scheduling. Can include periodization and progression rules.'
})
@ApiResponse({
  status: 201,
  description: 'Workout plan created successfully.',
  type: WorkoutPlanResponseDto
})
@ApiResponse({ 
  status: 403, 
  description: 'Forbidden - insufficient permissions.' 
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.' 
})
@ApiBody({ 
  type: CreateWorkoutPlanDto,
  examples: {
    strengthPlan: {
      value: {
        memberId: 123,
        planName: 'Strength Building Program',
        description: '8-week progressive strength training program',
        duration: 56,
        durationUnit: 'days',
        difficulty: 'intermediate',
        goals: ['Increase strength', 'Build muscle mass'],
        exercises: [
          {
            name: 'Bench Press',
            sets: 4,
            reps: 8,
            weight: 135,
            weightUnit: 'lbs',
            restTime: 120,
            notes: 'Focus on controlled movement'
          },
          {
            name: 'Deadlift',
            sets: 3,
            reps: 5,
            weight: 225,
            weightUnit: 'lbs',
            restTime: 180,
            notes: 'Maintain proper form'
          }
        ],
        schedule: {
          frequency: 3,
          daysPerWeek: ['monday', 'wednesday', 'friday']
        },
        createdBy: 'usr_1234567890abcdef'
      }
    }
  }
})
create(
  @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
  @CurrentUser() user: UserEntity,
) {
  return this.workoutsService.create(createWorkoutPlanDto, user.userId);
}

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('member/:memberId')
@ApiOperation({ 
  summary: 'Get workout plans for a specific member',
  description: 'Retrieves all active workout plans assigned to a specific member, including progress tracking and completion status.'
})
@ApiParam({ 
  name: 'memberId', 
  description: 'Member ID',
  example: 123
})
@ApiResponse({
  status: 200,
  description: 'Return workout plans for the member.',
  type: [WorkoutPlanDetailDto]
})
@ApiResponse({ 
  status: 404, 
  description: 'Member not found.',
  examples: {
    notFound: {
      value: {
        statusCode: 404,
        message: 'Member with ID 123 not found',
        error: 'Not Found'
      }
    }
  }
})
findByMember(@Param('memberId', ParseIntPipe) memberId: number) {
  return this.workoutsService.findByMember(memberId);
}
```

---

## Missing DTO Property Examples

Many DTOs throughout the application lack proper `@ApiProperty` decorators with examples. Here are key DTOs that need enhancement:

### 1. Common DTOs Missing @ApiProperty Examples

#### CreateUserDto
```typescript
// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'User email address' 
  })
  email: string;

  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'User password (minimum 8 characters)' 
  })
  password: string;

  @ApiProperty({ 
    example: 'John', 
    description: 'User first name' 
  })
  firstName: string;

  @ApiProperty({ 
    example: 'Doe', 
    description: 'User last name' 
  })
  lastName: string;

  @ApiProperty({ 
    example: 'role_member_123', 
    description: 'Role identifier' 
  })
  roleId: string;
}
```

#### LoginUserDto
```typescript
// src/auth/dto/login-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'User email address' 
  })
  email: string;

  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'User password' 
  })
  password: string;
}
```

#### CreateMemberDto
```typescript
// src/members/dto/create-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({ example: 'John', description: 'Member first name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Member last name' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Member email address' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth (YYYY-MM-DD)' })
  dateOfBirth: string;

  @ApiProperty({ example: '123 Main St, City, State', description: 'Home address' })
  address: string;

  @ApiProperty({ 
    example: {
      name: 'Jane Doe',
      phone: '+0987654321',
      relationship: 'Spouse'
    },
    description: 'Emergency contact information'
  })
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  @ApiProperty({ example: 1, description: 'Membership plan ID' })
  membershipPlanId: number;

  @ApiProperty({ example: 'branch_123', description: 'Branch ID' })
  branchId: string;
}
```

### 2. Response DTOs Missing Examples

#### LoginResponseDto
```typescript
// src/auth/dto/login-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ 
    example: 'usr_1234567890abcdef', 
    description: 'Unique user identifier' 
  })
  userid: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'JWT access token' 
  })
  access_token: string;
}
```

#### MemberResponseDto
```typescript
// src/members/dto/member-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MemberResponseDto {
  @ApiProperty({ example: 123, description: 'Member ID' })
  id: number;

  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: true, description: 'Membership status' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Registration date' })
  createdAt: string;
}
```

---

## Summary of Recommendations

### Priority 1 (Critical - Authentication & Security)
1. **Add @ApiBearerAuth() decorators** to all protected endpoints
2. **Document authentication requirements** clearly

### Priority 2 (Important - API Usability)
1. **Add @ApiOperation() descriptions** to all endpoints
2. **Include @ApiParam() examples** for all path parameters
3. **Add @ApiResponse() type definitions** with examples

### Priority 3 (Enhancement - Developer Experience)
1. **Add @ApiBody() examples** for POST/PUT endpoints
2. **Enhance DTOs with @ApiProperty() examples**
3. **Add @ApiQuery() documentation** for complex GET endpoints

### Priority 4 (Polish - Documentation Quality)
1. **Add detailed error response examples**
2. **Include success response schemas**
3. **Add comprehensive parameter descriptions**

---

## Additional Missing DTO Examples

### Progress Tracking DTOs
```typescript
// src/progress-tracking/dto/create-progress.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty({ example: 123, description: 'Member ID' })
  memberId: number;

  @ApiProperty({ example: 'weight', description: 'Type of progress tracking' })
  trackingType: string;

  @ApiProperty({ example: 165.5, description: 'Progress value' })
  value: number;

  @ApiProperty({ example: 'lbs', description: 'Unit of measurement' })
  unit: string;

  @ApiProperty({ example: '2024-01-01', description: 'Date of measurement' })
  measurementDate: string;

  @ApiProperty({ example: 'Monthly progress check', description: 'Optional notes' })
  notes?: string;
}
```

### Subscription DTOs
```typescript
// src/subscriptions/dto/create-subscription.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 123, description: 'Member ID' })
  memberId: number;

  @ApiProperty({ example: 1, description: 'Membership plan ID' })
  membershipPlanId: number;

  @ApiProperty({ example: '2024-01-01', description: 'Subscription start date' })
  startDate: string;

  @ApiProperty({ example: 'monthly', description: 'Billing cycle frequency' })
  billingCycle: string;

  @ApiProperty({ example: 'credit_card', description: 'Payment method' })
  paymentMethod: string;

  @ApiProperty({ example: true, description: 'Auto-renewal enabled' })
  autoRenew: boolean;

  @ApiProperty({ example: 'VIP membership upgrade', description: 'Optional notes' })
  notes?: string;
}
```

### Workout Logs DTOs
```typescript
// src/workout-logs/dto/create-workout-log.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutLogDto {
  @ApiProperty({ example: 123, description: 'Member ID' })
  memberId: number;

  @ApiProperty({ example: '2024-01-01', description: 'Workout date' })
  workoutDate: string;

  @ApiProperty({ example: 90, description: 'Workout duration in minutes' })
  duration: number;

  @ApiProperty({ 
    example: [
      {
        exerciseName: 'Bench Press',
        sets: 3,
        reps: 12,
        weight: 135,
        weightUnit: 'lbs'
      }
    ],
    description: 'List of exercises performed'
  })
  exercises: any[];

  @ApiProperty({ example: 'Great workout session', description: 'Overall workout notes' })
  overallNotes?: string;
}
```

### Workout Plans DTOs
```typescript
// src/workouts/dto/create-workout-plan.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 123, description: 'Member ID' })
  memberId: number;

  @ApiProperty({ example: 'Strength Building Program', description: 'Plan name' })
  planName: string;

  @ApiProperty({ example: '8-week progressive strength training', description: 'Plan description' })
  description: string;

  @ApiProperty({ example: 56, description: 'Plan duration' })
  duration: number;

  @ApiProperty({ example: 'days', description: 'Duration unit' })
  durationUnit: string;

  @ApiProperty({ example: 'intermediate', description: 'Difficulty level' })
  difficulty: string;

  @ApiProperty({ example: ['Increase strength', 'Build muscle'], description: 'Plan goals' })
  goals: string[];

  @ApiProperty({ 
    example: [
      {
        name: 'Bench Press',
        sets: 4,
        reps: 8,
        weight: 135,
        weightUnit: 'lbs'
      }
    ],
    description: 'List of exercises in the plan'
  })
  exercises: any[];
}
```

---

## Summary Statistics (Updated)

### Controller Analysis Summary:
- **Total Controllers Analyzed**: 23
- **Well Documented**: 2 (analytics, inquiries)
- **Needs Minor Improvements**: 4 (progress-tracking, subscriptions, workout-logs, workouts)
- **Needs Major Improvements**: 17 (all others)
- **Missing Controllers**: 1 (exercise-library)

### Missing Elements by Priority:

#### Priority 1 (Critical - Authentication & Security)
1. **@ApiBearerAuth() decorators** - 15 controllers need these
2. **Authentication documentation** - 15 controllers need clear auth requirements

#### Priority 2 (Important - API Usability)
1. **@ApiOperation() descriptions** - 20 controllers missing detailed descriptions
2. **@ApiParam() examples** - 18 controllers missing parameter examples
3. **@ApiResponse() type definitions** - 20 controllers missing response types

#### Priority 3 (Enhancement - Developer Experience)
1. **@ApiBody() examples** - 18 controllers missing request body examples
2. **DTO @ApiProperty() examples** - All DTOs need enhancement
3. **@ApiQuery() documentation** - Complex endpoints need query param docs

#### Priority 4 (Polish - Documentation Quality)
1. **Error response examples** - All controllers need better error handling docs
2. **Success response schemas** - All controllers need detailed response schemas
3. **Comprehensive parameter descriptions** - All controllers need this

---

## Implementation Priority (Updated)

**Week 1**: Add @ApiBearerAuth() decorators to 15 controllers and basic descriptions
**Week 2**: Add @ApiOperation() descriptions and @ApiParam() examples to all endpoints
**Week 3**: Add @ApiResponse() types and @ApiBody() examples
**Week 4**: Enhance DTOs with @ApiProperty() examples and error handling
**Week 5**: Create missing exercise-library controller and final polish

### Estimated Effort:
- **Critical fixes** (Authentication): 8 hours
- **Important improvements** (Descriptions, parameters): 16 hours  
- **Enhancement work** (Examples, DTOs): 20 hours
- **Polish and testing** (Error handling, validation): 12 hours
- **Total estimated effort**: 56 hours

This comprehensive analysis provides a complete roadmap for improving the Swagger documentation across all 23 controllers in the NestJS gym application.
