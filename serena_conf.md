# Serena MCP Configuration Guide

This document describes the Serena MCP (Model Context Protocol) setup for the new-nestjs-gym-app project.

## Overview

Serena provides semantic code editing capabilities through symbolic operations, allowing precise code navigation and modifications across the entire codebase.

## MCP Servers Available

| Server | Purpose |
|--------|---------|
| `plugin:serena:serena` | Semantic code editing, symbol operations, project memory |
| `plugin:compound-engineering:pw` | Browser automation with Playwright |
| `plugin:compound-engineering:context7` | Library documentation lookup |

## Serena Core Tools

### Symbolic Operations

```typescript
// Find symbols by name pattern
find_symbol({
  name_path_pattern: "MembersService/create",
  relative_path: "src/members/",
  include_body: true
})

// Find all references to a symbol
find_referencing_symbols({
  name_path: "Member",
  relative_path: "src/entities/member.entity.ts"
})

// Get overview of symbols in a file
get_symbols_overview({
  relative_path: "src/members/members.service.ts",
  depth: 1
})

// Rename symbol across codebase
rename_symbol({
  name_path: "create",
  new_name: "createMember",
  relative_path: "src/members/members.service.ts"
})

// Replace entire symbol body
replace_symbol_body({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  body: "new method body here"
})
```

### File Operations

```typescript
// Read file content
read_file({
  relative_path: "src/members/members.entity.ts"
})

// Create/overwrite file
create_text_file({
  relative_path: "src/test.txt",
  content: "file content"
})

// Search for patterns
search_for_pattern({
  substring_pattern: "find.*member",
  relative_path: "src/",
  restrict_search_to_code_files: true
})

// List directory
list_dir({
  relative_path: "src",
  recursive: false
})

// Find files by mask
find_file({
  file_mask: "*.service.ts",
  relative_path: "src"
})
```

### Content Editing

```typescript
// Replace content (literal mode)
replace_content({
  mode: "literal",
  needle: "old text",
  repl: "new text",
  relative_path: "src/members/members.service.ts"
})

// Replace content (regex mode)
replace_content({
  mode: "regex",
  needle: "create.*\\(",
  repl: "createMember(",
  relative_path: "src/members/members.service.ts",
  allow_multiple_occurrences: true
})

// Insert before/after symbol
insert_before_symbol({
  body: "new method before",
  name_path: "existingMethod",
  relative_path: "src/file.ts"
})

insert_after_symbol({
  body: "new method after",
  name_path: "existingMethod",
  relative_path: "src/file.ts"
})
```

### Shell Commands

```typescript
execute_shell_command({
  command: "npm run lint",
  cwd: "/path/to/project"
})
```

## Serena Modes

Serena operates in different modes for different tasks:

```typescript
switch_modes(["editing", "interactive"])   // Code editing mode
switch_modes(["planning", "one-shot"])     // Planning mode
switch_modes(["editing"])                   // Default editing mode
```

### Mode Descriptions

| Mode | Description |
|------|-------------|
| `editing` | Code modifications and file operations |
| `interactive` | Conversational assistance |
| `planning` | Plan mode for reviewing changes before execution |
| `one-shot` | Single task execution |

## Project Memory

Serena maintains project memories for context across sessions:

```typescript
// List all memories
list_memories()

// Read a memory
read_memory({ memory_file_name: "project_info.md" })

// Write a new memory
write_memory({
  content: "# Project Notes\n\nCustom notes here",
  memory_file_name: "custom_notes.md"
})

// Edit memory content
edit_memory({
  memory_file_name: "notes.md",
  mode: "literal",
  needle: "old text",
  repl: "new text"
})

// Delete memory
delete_memory({ memory_file_name: "old_notes.md" })
```

### Default Memory Files

Onboarding creates these memories:

| File | Purpose |
|------|---------|
| `suggested_commands.md` | All essential commands (dev, test, git, database) |
| `style_and_conventions.md` | Naming rules, code patterns, TypeScript standards |
| `task_completion.md` | Checklist for verifying task completion |
| `project_info.md` | Project overview, tech stack, architecture |

## Usage Examples

### Example 1: Find and Modify a Method

```typescript
// 1. Find the symbol
const symbols = find_symbol({
  name_path_pattern: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  include_body: true
});

// 2. Modify the method body
replace_symbol_body({
  name_path: "MembersService/create",
  relative_path: "src/members/members.service.ts",
  body: "async create(createMemberDto: CreateMemberDto): Promise<Member> {\n  // new implementation\n}"
});
```

### Example 2: Rename Refactoring

```typescript
// Rename a method across all files
rename_symbol({
  name_path: "MembersService/createMember",
  new_name: "registerMember",
  relative_path: "src/members/members.service.ts"
});

// Check all references were updated
const refs = find_referencing_symbols({
  name_path: "registerMember",
  relative_path: "src/members/members.service.ts"
});
```

### Example 3: Search and Replace

```typescript
// Find all occurrences of a pattern
search_for_pattern({
  substring_pattern: "find.*By.*Id",
  relative_path: "src",
  context_lines_before: 2,
  context_lines_after: 2
});

// Replace in multiple files
replace_content({
  mode: "regex",
  needle: "findById",
  repl: "findByPrimaryKey",
  relative_path: "src",
  allow_multiple_occurrences: true
});
```

## Integration with Claude Code

When using Claude Code with Serena MCP:

1. **Plan Mode**: Design changes with Claude's reasoning
2. **Exit Plan Mode**: Approve the plan
3. **Execution**: Serena tools perform precise code modifications

```bash
# In Claude Code
/plan  # Enter plan mode
# Design your changes
/exit-plan-mode  # Approve and exit
# Serena executes the changes
```

## MCP Plugin Combinations

### Code Editing + Browser Testing

```typescript
// Code changes with Serena
find_symbol({...})
replace_content({...})

// Browser testing with Playwright
browser_navigate({ url: "http://localhost:3000/api" })
browser_click({...})
```

### Code + Documentation Lookup

```typescript
// Get Context7 docs for a library
resolve_library_id({ libraryName: "@nestjs/typeorm" })
query_docs({
  libraryId: "/nestjs/typeorm",
  query: "How to use repositories"
})
```

## Best Practices

1. **Use symbolic operations** instead of text replacement when possible
2. **Check references** before renaming to understand impact
3. **Use project memories** to store project-specific conventions
4. **List memories first** to understand available context
5. **Use regex mode** for complex multi-line replacements

## Troubleshooting

### Project Not Activated
```typescript
activate_project({ project: "/path/to/project" })
```

### Check Current Configuration
```typescript
get_current_config()
```

### Re-run Onboarding
```typescript
check_onboarding_performed()  // Check if done
onboarding()                  // Run onboarding
```

## File Structure Reference

```
project/
├── serena_conf.md           # This file
├── CLAUDE.md               # Claude Code instructions
├── src/                    # Source code
│   ├── members/           # Feature module
│   ├── trainers/          # Feature module
│   └── entities/          # TypeORM entities
└── package.json           # Dependencies
```

## Commands Quick Reference

| Action | Command |
|--------|---------|
| Start dev server | `npm run start:dev` |
| Lint code | `npm run lint` |
| Format code | `npm run format` |
| Run tests | `npm run test` |
| Build project | `npm run build` |
| Create migration | `npm run typeorm migration:create -- -n MigrationName` |

## Learn More

- Serena MCP provides precise symbolic code operations
- Combine with other MCP plugins (Playwright, Context7) for full-stack support
- Use project memories to maintain context across sessions
