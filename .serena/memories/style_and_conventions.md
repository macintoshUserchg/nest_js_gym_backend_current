# Gym Management System - Coding Style and Conventions

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── config/             # JWT configuration
│   ├── decorators/         # Custom decorators (@CurrentUser)
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Authentication guards
│   ├── strategies/         # Passport strategies
│   ├── types/              # TypeScript type definitions
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module definition
├── entities/               # TypeORM entities (27 total)
│   ├── *.entity.ts        # Database tables
├── common/                 # Shared utilities
│   ├── dto/               # Shared DTOs
│   └── enums/             # Shared enums
├── [feature-name]/         # Feature modules (23 modules)
│   ├── dto/              # Feature DTOs
│   ├── [feature].controller.ts  # Routes
│   ├── [feature].service.ts     # Business logic
│   └── [feature].module.ts      # Module definition
├── app.module.ts          # Root module
└── main.ts               # Application bootstrap
```

## Naming Conventions

### Files

- **Controllers**: `[name].controller.ts` (e.g., `members.controller.ts`)
- **Services**: `[name].service.ts` (e.g., `members.service.ts`)
- **Modules**: `[name].module.ts` (e.g., `members.module.ts`)
- **DTOs**: `[action]-[entity].dto.ts` (e.g., `create-member.dto.ts`)
- **Entities**: `[name].entity.ts` (e.g., `members.entity.ts`)

### Classes

- **Controllers**: PascalCase with `Controller` suffix
  ```typescript
  export class MembersController {}
  ```

- **Services**: PascalCase with `Service` suffix
  ```typescript
  export class MembersService {}
  ```

- **DTOs**: PascalCase with `Dto` suffix
  ```typescript
  export class CreateMemberDto {}
  export class UpdateMemberDto {}
  export class AdminUpdateMemberDto {}
  ```

- **Entities**: PascalCase matching table name
  ```typescript
  @Entity('members')
  export class Member {}
  ```

### Methods

- **Service Methods**: camelCase, descriptive verbs
  ```typescript
  async findAll() {}
  async findOne(id: number) {}
  async create(dto: CreateDto) {}
  async update(id: number, dto: UpdateDto) {}
  async remove(id: number) {}
  async findByBranch(branchId: string) {}
  ```

### Variables

- **camelCase** for local variables and parameters
  ```typescript
  const memberId = 1;
  const branchId = 'uuid';
  ```

### Database Tables

- **snake_case** for table names
  ```typescript
  @Entity('member_subscriptions')
  export class MemberSubscription {}
  ```

### Database Columns

- **snake_case** for columns (TypeORM auto-maps)
  ```typescript
  @Column({ name: 'branch_branch_id' })
  branchBranchId: string;
  ```

## Entity Patterns

### Primary Keys

- **UUID** for distributed entities, user-facing entities
  ```typescript
  @PrimaryGeneratedColumn('uuid')
  userId: string;
  ```

- **Auto-increment** for internal business entities
  ```typescript
  @PrimaryGeneratedColumn()
  id: number;
  ```

### Relationships

- **ManyToOne** (ownership)
  ```typescript
  @ManyToOne(() => Branch, (branch) => branch.members)
  branch: Branch;
  ```

- **OneToMany** (collection)
  ```typescript
  @OneToMany(() => Member, (member) => member.branch)
  members: Member[];
  ```

- **Many-to-Many**: Not currently used (use junction entities)

### Cascade Deletes

- **Use for** child entities that cannot exist without parent
  ```typescript
  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  member: Member;
  ```

### Timestamps

- **Automatic timestamps** for all entities
  ```typescript
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  ```

## Controller Patterns

### Standard CRUD

```typescript
@ApiTags('resource-name')
@Controller('resource-path')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, type: Entity })
  create(@Body() createDto: CreateDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all resources' })
  @ApiResponse({ status: 200, type: [Entity] })
  findAll(@Query() filters?: any) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, type: Entity })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update resource' })
  @ApiResponse({ status: 200, type: Entity })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({ status: 200, type: Entity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

### Nested Controllers

```typescript
@ApiTags('parent-resource')
@Controller('parent-resource')
export class ParentController {
  // Parent CRUD endpoints
}

@ApiTags('child-resources')
@Controller('parent-resource/:parentId/child-resources')
export class ChildController {
  @Get()
  findByParent(@Param('parentId') parentId: string) {
    return this.service.findByParent(parentId);
  }
}
```

### Role-Based Endpoints

```typescript
@Patch('admin/:id')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Admin update' })
adminUpdate(
  @Param('id') id: number,
  @Body() adminDto: AdminDto,
  @CurrentUser() user: User,
) {
  // Role check in controller
  if (!['ADMIN', 'SUPERADMIN'].includes(user.role.name)) {
    throw new ForbiddenException('Admin access required');
  }
  return this.service.adminUpdate(id, adminDto);
}
```

## Service Patterns

### Repository Injection

```typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Entity)
    private repo: Repository<Entity>,
    @InjectRepository(RelatedEntity)
    private relatedRepo: Repository<RelatedEntity>,
  ) {}
}
```

### Error Handling

```typescript
async findOne(id: number) {
  const entity = await this.repo.findOne({ where: { id } });
  if (!entity) {
    throw new NotFoundException(`Entity with ID ${id} not found`);
  }
  return entity;
}

async create(dto: CreateDto) {
  // Check for duplicates
  const existing = await this.repo.findOne({ where: { email: dto.email } });
  if (existing) {
    throw new ConflictException('Entity with this email already exists');
  }
  // ... creation logic
}
```

### Query Building with Filters

```typescript
async findAll(branchId?: string, status?: string, search?: string) {
  const queryBuilder = this.repo
    .createQueryBuilder('entity')
    .leftJoinAndSelect('entity.relation', 'relation');

  if (branchId) {
    queryBuilder.andWhere('relation.branchId = :branchId', { branchId });
  }

  if (status) {
    queryBuilder.andWhere('entity.status = :status', { status });
  }

  if (search) {
    queryBuilder.andWhere('entity.name ILIKE :search', { search: `%${search}%` });
  }

  return queryBuilder.getMany();
}
```

### Transactions

```typescript
async create(dto: CreateDto) {
  return await this.dataSource.transaction(async (manager) => {
    // Check duplicates inside transaction
    const existing = await manager.findOne(Entity, {
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Duplicate found');
    }

    // Create and save entities
    const entity = manager.create(Entity, dto);
    const saved = await manager.save(entity);
    
    // Create related entities
    const related = manager.create(Related, { entityId: saved.id });
    await manager.save(related);
    
    return saved;
  });
}
```

## DTO Patterns

### Create DTO

```typescript
export class CreateMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'male', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  selectedClassIds?: string[];
}
```

### Update DTO (PartialType)

```typescript
export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
```

### Response DTO

```typescript
export class MemberResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: SubscriptionDto })
  subscription: SubscriptionDto;
}
```

## Validation Patterns

### Global Validation Pipe (main.ts)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Strip non-whitelisted properties
    transform: true,        // Transform types automatically
    forbidNonWhitelisted: true,  // Throw error for non-whitelisted
  }),
);
```

### Common Validators

```typescript
@IsString()
@IsNotEmpty()
@IsEmail()
@IsEnum(EnumType)
@IsOptional()
@IsUUID()
@IsInt()
@IsArray()
@IsDateString()
@Min(0)
@Max(100)
```

## Authentication Patterns

### JWT Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Current User Decorator

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
```

### Protected Route

```typescript
@Get('profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Module Patterns

### Standard Module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [Controller],
  providers: [Service],
  exports: [Service],
})
export class FeatureModule {}
```

## Swagger Documentation Patterns

### Controller Tags

```typescript
@ApiTags('resource-name')
@Controller('resources')
export class ResourcesController {}
```

### Endpoint Documentation

```typescript
@ApiOperation({
  summary: 'Brief description',
  description: 'Detailed description of what this endpoint does',
})
```

### Response Examples

```typescript
@ApiResponse({
  status: 200,
  description: 'Success',
  examples: {
    success: {
      summary: 'Successful response',
      value: { id: 1, name: 'Example' },
    },
  },
})
```

## TypeORM Query Patterns

### Basic Find

```typescript
const entity = await this.repo.findOne({ where: { id } });
```

### With Relations

```typescript
const entity = await this.repo.findOne({
  where: { id },
  relations: ['relation1', 'relation2'],
});
```

### Query Builder (Complex)

```typescript
const results = await this.repo
  .createQueryBuilder('alias')
  .leftJoinAndSelect('alias.relation', 'relation')
  .where('alias.field = :value', { value })
  .andWhere('relation.field ILIKE :search', { search: `%${term}%` })
  .orderBy('alias.createdAt', 'DESC')
  .getMany();
```

### ILIKE for Case-Insensitive Search

```typescript
.where('entity.name ILIKE :search', { search: `%${term}%` })
```

## Error Response Patterns

### Standard NestJS Exceptions

```typescript
throw new NotFoundException('Resource not found');
throw new ConflictException('Resource already exists');
throw new ForbiddenException('Access denied');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Invalid input');
```

## Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(plainPassword, 10);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

## Array Field Handling (PostgreSQL)

### UUID Arrays

```typescript
@Column({ type: 'uuid', array: true, nullable: true })
selectedClassIds: string[];

// Raw SQL update for UUID arrays
const uuidArray = dto.ids.map((id) => `'${id}'::uuid`).join(', ');
await this.dataSource.manager.query(
  `UPDATE table SET "selectedClassIds" = ARRAY[${uuidArray}] WHERE id = $1`,
  [entityId],
);
```

## Best Practices

1. **Always use repository pattern** - Never use raw SQL unless necessary
2. **Validate all inputs** - Use class-validator decorators
3. **Handle all errors** - Use try-catch in service methods
4. **Use transactions** - For multi-entity operations
5. **Cascade deletes appropriately** - Maintain referential integrity
6. **Document with Swagger** - All endpoints should have documentation
7. **Use ILIKE for search** - Case-insensitive PostgreSQL searches
8. **Check for duplicates** - Before creating entities
9. **Filter sensitive data** - Never return passwordHash
10. **Use custom decorators** - For frequently used params like @CurrentUser

## Anti-Patterns to Avoid

1. **Don't use any** - Use proper TypeScript types
2. **Don't nest routes deeply** - Max 2 levels (e.g., `/gyms/:id/branches`)
3. **Don't put business logic in controllers** - Keep in services
4. **Don't return raw errors** - Use NestJS exceptions
5. **Don't hardcode IDs** - Use relationships
6. **Don't forget @UseGuards** - Protect all non-public routes
7. **Don't skip validation** - Always validate DTOs
8. **Don't use synchronize in production** - Use migrations
