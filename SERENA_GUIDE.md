# Serena - Codebase Navigation & Editing Guide

This document explains how to use **Serena**, a symbolic coding tool, for efficient navigation and editing of this NestJS gym management codebase.

---

## What is Serena?

Serena is a semantic code navigation and editing tool that works with **symbols** (classes, methods, functions) rather than line numbers. It provides precise, symbol-aware operations across your entire codebase.

---

## Prerequisites

Serena MCP server must be configured. The project is already activated at:
```
/Users/chandangaur/development/Nest JS/new-nestjs-gym-app
```

---

## Serena Tools Reference

### 1. Symbol Navigation

#### `find_symbol`
Find symbols (classes, methods, functions) by name pattern.

**Parameters:**
- `name_path_pattern`: Pattern to match (e.g., "create", "MembersService/create")
- `relative_path`: Optional - restrict to specific file/directory
- `substring_matching`: true/false - use partial matching
- `depth`: 0+ - include child symbols
- `include_body`: true/false - include source code

**Examples:**
```typescript
// Find all methods named "create"
find_symbol({ name_path_pattern: "create" })

// Find create method in MembersService
find_symbol({ name_path_pattern: "MembersService/create" })

// Find with substring matching
find_symbol({ name_path_pattern: "Service", substring_matching: true })
```

#### `get_symbols_overview`
Get all symbols in a file with their types.

**Parameters:**
- `relative_path`: Path to file
- `depth`: 0+ - include nested symbols

**Example:**
```typescript
get_symbols_overview({ relative_path: "src/members/members.service.ts" })
```

#### `find_referencing_symbols`
Find all symbols that reference a given symbol.

**Parameters:**
- `name_path`: Full symbol path (e.g., "Member")
- `relative_path`: File containing the symbol

**Example:**
```typescript
find_referencing_symbols({ name_path: "Member", relative_path: "src/entities/member.entity.ts" })
```

---

### 2. File Operations

#### `read_file`
Read file contents with optional line range.

**Parameters:**
- `relative_path`: File path
- `start_line`: 0-based start
- `end_line`: 0-based end (inclusive)

**Example:**
```typescript
read_file({ relative_path: "src/members/members.service.ts", start_line: 0, end_line: 50 })
```

#### `create_text_file`
Create or overwrite a file.

**Parameters:**
- `relative_path`: File path
- `content`: File content

**Example:**
```typescript
create_text_file({
  relative_path: "src/test.dto.ts",
  content: "export class TestDto { ... }"
})
```

#### `list_dir`
List directory contents.

**Parameters:**
- `relative_path`: Directory path
- `recursive`: true/false - include subdirectories

**Example:**
```typescript
list_dir({ relative_path: "src", recursive: false })
```

#### `find_file`
Find files by name pattern.

**Parameters:**
- `file_mask`: Filename with wildcards (*, ?)
- `relative_path`: Search directory

**Example:**
```typescript
find_file({ file_mask: "*.service.ts", relative_path: "src" })
```

---

### 3. Symbol Editing

#### `replace_symbol_body`
Replace entire function/class body.

**Parameters:**
- `name_path`: Symbol name path (e.g., "MembersService/create")
- `relative_path`: File containing the symbol
- `body`: New implementation

**Example:**
```typescript
replace_symbol_body({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  body: "async create(dto: CreateMemberDto) { ... }"
})
```

#### `insert_before_symbol`
Insert code before a symbol definition.

**Parameters:**
- `name_path`: Symbol to insert before
- `relative_path`: File path
- `body`: Code to insert

**Example:**
```typescript
insert_before_symbol({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  body: "private validateDto(dto: any): void { ... }"
})
```

#### `insert_after_symbol`
Insert code after a symbol definition.

**Parameters:**
- `name_path`: Symbol to insert after
- `relative_path`: File path
- `body`: Code to insert

**Example:**
```typescript
insert_after_symbol({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  body: "private async generateMemberId(): Promise<string> { ... }"
})
```

#### `rename_symbol`
Rename a symbol throughout the entire codebase.

**Parameters:**
- `name_path`: Current symbol path
- `relative_path`: File containing the symbol
- `new_name`: New symbol name

**Example:**
```typescript
rename_symbol({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  new_name: "createMember"
})
```

---

### 4. Pattern Search

#### `search_for_pattern`
Search for patterns across files.

**Parameters:**
- `substring_pattern`: Regex pattern
- `relative_path`: Restrict to directory
- `context_lines_before/after`: Lines of context
- `paths_include_glob`: File glob pattern
- `paths_exclude_glob`: Files to skip

**Examples:**
```typescript
// Find all occurrences of "isActive"
search_for_pattern({ substring_pattern: "isActive" })

// Find in specific directory with context
search_for_pattern({
  substring_pattern: "async.*create",
  relative_path: "src/members",
  context_lines_after: 3
})
```

---

### 5. Memory System

Store and retrieve project knowledge across sessions.

#### `write_memory`
Store information for future tasks.

**Parameters:**
- `memory_file_name`: Unique name
- `content`: Information to store

**Example:**
```typescript
write_memory({
  memory_file_name: "project_patterns",
  content: "# Custom Patterns\n\n## Service Creation Pattern\n- DTOs are in `dto/` subdirectory\n- Entities use snake_case table names\n..."
})
```

#### `read_memory`
Retrieve stored information.

**Parameters:**
- `memory_file_name`: Name of memory to read

**Example:**
```typescript
read_memory({ memory_file_name: "project_patterns" })
```

#### `list_memories`
List all available memories.

---

## Workflow Examples

### Example 1: Understanding a New Feature

1. Find all service files:
   ```typescript
   find_file({ file_mask: "*.service.ts", relative_path: "src" })
   ```

2. Get symbols overview:
   ```typescript
   get_symbols_overview({ relative_path: "src/members/members.service.ts" })
   ```

3. Find related entities:
   ```typescript
   find_referencing_symbols({ name_path: "Member", relative_path: "src/entities/member.entity.ts" })
   ```

### Example 2: Adding a New Method

1. Find existing similar methods:
   ```typescript
   find_symbol({ name_path_pattern: "MembersService", depth: 1 })
   ```

2. Insert new method:
   ```typescript
   insert_after_symbol({
     name_path: "MembersService/create",
     relative_path: "src/members/members.service.ts",
     body: "async update(id: number, dto: UpdateMemberDto) { ... }"
   })
   ```

### Example 3: Refactoring

1. Rename symbol across codebase:
   ```typescript
   rename_symbol({
     name_path: "MembersService",
     relative_path: "src/members/members.service.ts",
     new_name: "MemberManagementService"
   })
   ```

### Example 4: Debugging - Find Where Something is Used

1. Find all references:
   ```typescript
   find_referencing_symbols({ name_path: "create", relative_path: "src/members/members.service.ts" })
   ```

2. Search for usage patterns:
   ```typescript
   search_for_pattern({ substring_pattern: "membersService\\.create", relative_path: "src" })
   ```

---

## Common Patterns in This Project

### Entity Pattern
```typescript
// Entities are in: src/entities/*.entity.ts
// Table name: snake_case
// Primary key: uuid or auto-increment
@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;
}
```

### Service Pattern
```typescript
@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(dto: CreateMemberDto) { ... }
}
```

### Controller Pattern
```typescript
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}
}
```

---

## Quick Reference

| Task | Serena Tool |
|------|-------------|
| Find a class/method | `find_symbol` |
| List all symbols in file | `get_symbols_overview` |
| Find all uses of X | `find_referencing_symbols` |
| Read file | `read_file` |
| Write file | `create_text_file` |
| Find files by name | `find_file` |
| Replace method body | `replace_symbol_body` |
| Insert code | `insert_before_symbol` / `insert_after_symbol` |
| Rename everywhere | `rename_symbol` |
| Search patterns | `search_for_pattern` |
| Store project info | `write_memory` |
| Get stored info | `read_memory` |

---

## Tips

1. **Use depth parameter**: Set `depth: 1` to get methods of a class without their implementations.

2. **Use substring matching**: For fuzzy searches, set `substring_matching: true`.

3. **Restrict searches**: Use `relative_path` to limit searches to specific directories.

4. **Use memories**: Store common patterns, conventions, and project-specific knowledge.

5. **Combine tools**: Use `find_symbol` + `read_file` + `replace_symbol_body` for efficient refactoring.

---

## File Paths Reference

| Feature | Entity | Service | Controller |
|---------|--------|---------|------------|
| Members | `src/entities/members.entity.ts` | `src/members/members.service.ts` | `src/members/members.controller.ts` |
| Workouts | `src/entities/workout_logs.entity.ts` | `src/workout-logs/workout-logs.service.ts` | `src/workout-logs/workout-logs.controller.ts` |
| Diet Plans | `src/entities/diet_plans.entity.ts` | `src/diet-plans/diet-plans.service.ts` | `src/diet-plans/diet-plans.controller.ts` |
| Body Progress | `src/entities/body_progress.entity.ts` | `src/body-progress/body-progress.service.ts` | `src/body-progress/body-progress.controller.ts` |
| Goals | `src/entities/goals.entity.ts` | `src/goals/goals.service.ts` | `src/goals/goals.controller.ts` |

---

## Related Documentation

- `CLAUDE.md` - General project overview and conventions
- `src/database/` - Database schema and seeds
- `src/entities/` - TypeORM entities (27 total)
