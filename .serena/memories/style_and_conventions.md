# Code Style and Conventions for new-nestjs-gym-app

## Naming Conventions

### Files and Directories
- **Module files**: kebab-case (e.g., `member-subscriptions`, `workout-logs`)
- **TypeScript files**: kebab-case (e.g., `create-member.dto.ts`, `members.service.ts`)

### Entity/Table Names
- **Database tables**: snake_case (e.g., `member_subscriptions`, `payment_transactions`)
- **Columns**: camelCase (e.g., `memberId`, `createdAt`, `isActive`)

### Variables and Properties
- **Variables**: camelCase (e.g., `memberId`, `subscriptionEndDate`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `JWT_EXPIRATION`, `DEFAULT_PAGE_SIZE`)

### TypeScript/Code
- **Classes**: PascalCase (e.g., `MemberSubscription`, `AttendanceService`)
- **Interfaces**: PascalCase (e.g., `IMemberCreate`, `CreateUserDto`)
- **Enums**: PascalCase (e.g., `UserRole`, `SubscriptionStatus`)
- **Functions**: camelCase (e.g., `createMember`, `calculateStreak`)

## Type Hints

### Required Type Annotations
- All function parameters must have explicit types
- Return types must be specified for all functions
- Use TypeScript strict mode (enabled in tsconfig.json)

### Common Type Patterns
```typescript
// Entity repositories
@InjectRepository(Entity)
private readonly entityRepository: Repository<Entity>

// UUID IDs
@Param('id') id: string

// Numeric IDs (auto-increment)
@Param('id', ParseIntPipe) id: number

// Current user from JWT
@CurrentUser() user: UserEntity
```

## Docstrings and Comments

### JSDoc for Classes
```typescript
/**
 * Service for managing member subscriptions.
 * Handles creation, renewal, and cancellation of subscriptions.
 */
@Injectable()
export class MemberSubscriptionService {}
```

### JSDoc for Methods
```typescript
/**
 * Creates a new member with associated user account and subscription.
 * Uses database transaction for atomicity.
 *
 * @param createMemberDto - Member creation data including personal info and plan
 * @returns Created member with full details
 * @throws BadRequestException if email already exists
 */
async create(createMemberDto: CreateMemberDto): Promise<Member> {}
```

## Code Organization

### Module Structure Pattern
```
src/<module>/
├── <module>.module.ts      # Module definition
├── <module>.controller.ts  # HTTP endpoints
├── <module>.service.ts     # Business logic
├── dto/
│   ├── create-<module>.dto.ts
│   └── update-<module>.dto.ts
└── types/                  # Optional type definitions
```

### Standard Controller Pattern
```typescript
@Controller('module')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  async create(@Body() createDto: CreateModuleDto) {
    return this.moduleService.create(createDto);
  }
}
```

### Standard Service Pattern
```typescript
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
  ) {}
}
```

## Import Order

1. Node.js built-in modules
2. Third-party packages (@nestjs/*, typeorm, etc.)
3. Internal imports (src/*)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
```

## Formatting Rules

### Prettier Configuration
- Use Prettier for formatting (configured in `.prettierrc`)
- Run `npm run format` before committing

### Line Length
- Maximum line length: 100 characters (Prettier default)

### Semicolons
- Use semicolons (TypeScript standard)

## Entity Design Rules

### Primary Keys
- **UUID** for: User, Role, Gym, Branch, Class, Attendance, Invoice, AuditLog, etc.
- **Auto-increment** for: Member, Trainer, Inquiry, WorkoutLog, Goal, etc.

### Foreign Keys
- Format: `<entity>Id` (e.g., `gymId`, `memberId`, `branchId`)

### Timestamps
- Always include: `createdAt`, `updatedAt`

### Relationships
- Use TypeORM decorators: `@ManyToOne`, `@OneToMany`, `@OneToOne`, `@JoinColumn`
- Cascade delete for dependent entities (e.g., payments → invoice)

## Validation Rules

### DTO Validation
- Use `class-validator` decorators
- Use `class-transformer` for transformation
- Validate at controller level with global ValidationPipe

### Common Validators
```typescript
@IsEmail()
@IsString()
@IsOptional()
@IsInt()
@Min()
@Max()
@IsEnum(UserRole)
```

## Error Handling

### HttpException Pattern
```typescript
throw new NotFoundException(`Member with ID ${id} not found`);
throw new BadRequestException('Invalid subscription dates');
```

### Error Codes
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication failed)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate entry)
