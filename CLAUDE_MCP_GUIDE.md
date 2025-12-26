# Claude MCP Usage Guide

This guide explains how to use Model Context Protocol (MCP) servers with Claude Code in this NestJS gym management project.

## 🎯 What is MCP?

**MCP (Model Context Protocol)** is a protocol that allows Claude to connect to external tools and data sources, extending its capabilities beyond the codebase.

## 📋 Available MCP Servers

This project has access to several MCP servers:

### 1. **Context7** - Documentation & Code Examples
- **Purpose**: Get up-to-date documentation and code examples for libraries
- **Use Cases**:
  - Library documentation lookup
  - Code examples for frameworks
  - API reference queries

**Example Usage:**
```
@context7 Get examples for NestJS TypeORM repositories
@context7 Show me how to use class-validator decorators
```

### 2. **Filesystem** - File Operations
- **Purpose**: Read, write, and manage files
- **Capabilities**:
  - Read multiple files at once
  - Search for files by pattern
  - Create/edit files
  - List directories

**Example Usage:**
```
@filesystem Read all files in src/entities/
@filesystem Search for files matching "controller.ts"
```

### 3. **Memory** - Knowledge Graph
- **Purpose**: Store and retrieve project knowledge
- **Capabilities**:
  - Save decisions and context
  - Track entities and relationships
  - Search across sessions
  - Visualize knowledge graph

**Example Usage:**
```
@memory Save that this project uses multi-tenant architecture
@memory Find all entities related to member management
```

### 4. **IDE** - VS Code Integration
- **Purpose**: Get IDE diagnostics and execute code
- **Capabilities**:
  - Get TypeScript errors
  - Run code in Jupyter kernel
  - Access editor state

**Example Usage:**
```
@ide Get diagnostics for src/gyms/gyms.service.ts
@ide Execute a test query
```

### 5. **Sequential Thinking** - Complex Problem Solving
- **Purpose**: Break down complex problems step-by-step
- **Capabilities**:
  - Multi-step reasoning
  - Course correction
  - Branch exploration
  - Hypothesis testing

**Example Usage:**
```
@sequential-thinking Plan the implementation of a new feature
@sequential-thinking Analyze this bug and find root cause
```

## 🚀 Common MCP Workflows

### Workflow 1: Understanding a New Library

```
1. @context7 Get documentation for @nestjs/typeorm
2. @filesystem Read src/database/dbConfig.ts
3. @memory Save key configuration patterns
4. @sequential-thinking Plan how to implement a new entity
```

### Workflow 2: Debugging Complex Issues

```
1. @ide Get diagnostics for the problematic file
2. @filesystem Read related files (entities, services, controllers)
3. @memory Search for similar issues or patterns
4. @sequential-thinking Analyze the problem step-by-step
```

### Workflow 3: Adding New Features

```
1. @context7 Get examples for the feature pattern
2. @filesystem Read existing similar features
3. @memory Save architectural decisions
4. @sequential-thinking Plan implementation steps
```

## 🔧 MCP Command Syntax

### Direct Commands
```
@server_name Command or query
```

### Examples by Server

**Context7:**
```
@context7 Show me NestJS authentication examples
@context7 TypeORM repository methods with examples
```

**Filesystem:**
```
@filesystem Read src/entities/gym.entity.ts
@filesystem List all files in src/gyms/
@filesystem Search for "repository" in src/
```

**Memory:**
```
@memory Save that we use UUID primary keys
@memory Find all references to member subscriptions
@memory Show me the knowledge graph
```

**IDE:**
```
@ide Get diagnostics for src/
@ide Check TypeScript errors in current file
```

**Sequential Thinking:**
```
@sequential-thinking Plan the workout log feature
@sequential-thinking Debug the subscription cancellation flow
```

## 🎯 Project-Specific MCP Usage

### Database Schema Understanding
```
@filesystem Read all files in src/entities/
@memory Save the database schema overview
@sequential-thinking Explain the relationship between members and subscriptions
```

### API Architecture
```
@filesystem Read src/app.module.ts
@filesystem List all controller files
@memory Save the module structure
```

### Testing Strategy
```
@filesystem Read existing test files
@context7 Get NestJS testing best practices
@sequential-thinking Plan comprehensive test coverage
```

## 💡 Pro Tips

### 1. Combine Multiple Servers
```
@filesystem Read the seed file
@sequential-thinking Analyze what data is created
@memory Save the test data summary
```

### 2. Store Important Decisions
```
@memory Save that we use UUID for gymId and auto-increment for members
@memory Save that roles are preserved during seeding
```

### 3. Search Across Sessions
```
@memory Search for "subscription" across all sessions
@memory Find all decisions about authentication
```

### 4. Get Code Examples
```
@context7 Show me NestJS DTO validation examples
@context7 TypeORM repository pattern examples
```

## 🔍 Troubleshooting

### If MCP commands don't work:
1. Check if the server is available: `@memory status`
2. Verify the command syntax: `@server_name help`
3. Try a simpler query first

### If context is lost:
1. Use `@memory` to save key information
2. Use `@sequential-thinking` to maintain reasoning chain
3. Reference previous context explicitly

## 📚 Best Practices

1. **Save architectural decisions**: Use `@memory` to store important choices
2. **Break down complex tasks**: Use `@sequential-thinking` for multi-step problems
3. **Reference documentation**: Use `@context7` for library-specific questions
4. **Search before asking**: Use `@memory search` to find existing knowledge
5. **Combine tools**: Use multiple MCP servers for comprehensive solutions

## 🎓 Learning MCP

### Start Simple
```
@filesystem Read README.md
@memory Save project overview
```

### Gradually Increase Complexity
```
@sequential-thinking Plan a new feature
@context7 Get relevant examples
@filesystem Create the implementation
```

### Build Knowledge Over Time
```
@memory Save patterns as you learn them
@memory Search for patterns when needed
```

## 🚀 Advanced Usage

### Multi-Step Analysis
```
@filesystem Read src/gyms/gyms.service.ts
@context7 Get NestJS service best practices
@sequential-thinking Analyze how to improve the service
@memory Save improvement recommendations
```

### Cross-Reference Research
```
@filesystem Read entity definitions
@context7 Get TypeORM relationship examples
@memory Save relationship patterns
```

---

**Remember**: MCP servers extend Claude's capabilities. Use them to access external knowledge, perform operations, and maintain context across sessions!

**Quick Reference:**
- `@context7` - Documentation & examples
- `@filesystem` - File operations
- `@memory` - Knowledge storage
- `@ide` - IDE integration
- `@sequential-thinking` - Complex problem solving
