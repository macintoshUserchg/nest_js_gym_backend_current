# MCP Servers Usage Guide for Cline

## Overview
Your Cline is equipped with **8 powerful MCP servers** creating a complete development ecosystem. This guide shows you how to use each one effectively.

---

## Server-by-Server Usage

### 1. Filesystem Server
**Purpose**: File operations in your project
**Location**: `/Users/chandangaur/development/Nest JS/new-nestjs-gym-app`

**Usage Examples**:
```bash
# Read a file
"Read src/auth/auth.service.ts"

# Create a new module
"Create src/gym/gym.module.ts with basic NestJS module structure"

# Search for patterns
"Find all files containing 'workout' in the src directory"

# Get directory overview
"Show me the directory tree of src/"

When to use: Always - it's your primary file interaction tool

### 2. Context7 MCP
**Purpose**: Fetch library documentation and best practices

**Usage Examples**:
```bash
# Get NestJS docs
"Use context7 to get NestJS interceptor documentation"

# Research packages
"Use context7 to get TypeORM entity relationship best practices"

# Get specific patterns
"Use context7 to find NestJS authentication guard examples"

When to use: When you need official documentation or implementation patterns

### 3. Sequential Thinking Server
**Purpose**: Step-by-step reasoning for complex problems

**Usage Examples**:
```bash
# Plan complex feature
"Use sequentialthinking to plan JWT authentication flow for gym members"

# Debug strategy
"Use sequentialthinking to debug why the workout scheduler isn't triggering"

# Architecture design
"Use sequentialthinking to design the payment subscription system"

When to use: For complex logic, multi-step problems, or architecture decisions

### 4. Fetch MCP
**Purpose**: Retrieve web content (HTML, Markdown, JSON, TXT)

**Usage Examples**:
```bash
# Get API documentation
"Fetch and summarize https://api.example.com/docs"

# Research standards
"Fetch JSON from https://fitness-api-standards.org and extract key endpoints"

# Get articles
"Fetch markdown from https://example.com/nestjs-performance-tips"

When to use: When you need external references, API docs, or web research

### 5. Mobile MCP
**Purpose**: Test on physical/virtual mobile devices

**Usage Examples**:
```bash
# Test app on device
"Install the gym app on the connected device and launch it"

# UI testing
"Take a screenshot of the current screen and analyze the layout"

# Interaction testing
"Click on the login button at coordinates (200, 400)"

When to use: Mobile app testing, UI verification, device-specific debugging

### 6. Code Mode MCP
**Purpose**: Tool discovery and orchestration

**Usage Examples**:
```bash
# Discover tools
"List all available tools in code-mode"

# Chain operations
"Register a tool that combines filesystem write + memory update"

# Complex workflows
"Use code-mode to orchestrate: fetch API docs → create entity → store in memory"

When to use: When you need to automate multi-server workflows

### 7. Memory Server (Knowledge Graph)
**Purpose**: Store structured relationships and entities

**Usage Examples**:
```bash
# Create entities
"Use memory to create entity 'User' with properties: id, email, role"

# Create relationships
"Use memory to relate 'User' → 'has' → 'WorkoutPlan'"

# Query the graph
"Use memory to find all entities related to 'Payment'"

# Add observations
"Use memory to add observation to 'AuthModule': uses JWT tokens"

When to use: Architecture mapping, decision tracking, relationship modeling

### 8. MCP Memory Keeper
**Purpose**: Chronological chat history storage

**Usage Examples**:
```bash
# Store decisions
"Store in memory-keeper: 2024-01-15: Chose PostgreSQL over MongoDB for scalability"

# Retrieve history
"What did we decide about user authentication last week?"

# List memories
"Show me all memories from this week"

# Session tracking
"Start a new session for workout module development"

When to use: Tracking decisions, resuming conversations, historical context

---

## Combined Workflows (Real Examples)

### Scenario 1: Building a New Feature
```bash
"1. Use context7 to get NestJS microservices best practices
2. Use sequentialthinking to plan the workout notification service
3. Use memory to create entity 'Notification' with relation to 'User'
4. Use memory-keeper to store: '2024-01-15: Started notification service'
5. Use filesystem to create the notification module files"
```

### Scenario 2: Debugging Complex Issue
```bash
"1. Use memory-keeper to find when this bug was first reported
2. Use memory graph to find related components
3. Use fetch to research similar issues on Stack Overflow
4. Use sequentialthinking to plan the fix strategy
5. Use filesystem to implement the solution"
```

### Scenario 3: Architecture Documentation
```bash
"1. Read all module files in /src
2. Use memory to create entities for each module
3. Use memory to create relations between modules
4. Use memory-keeper to log: 'Architecture mapped on [date]'
5. Use memory to query and display the complete architecture"
```

---

## Quick Reference Commands

### Memory Operations
```bash
# Knowledge Graph
"Use memory to create entity 'X'"
"Use memory to relate 'A' → 'B'"
"Use memory to show all entities"

# Chronological Memory
"Store in memory-keeper: [note]"
"What did we discuss about [topic]?"
"Show last 5 memories"
```

### Development
```bash
# Filesystem
"Read [file]"
"Write [file] with [content]"
"Search for [pattern] in [directory]"

# Documentation
"Use context7 to get [library] docs for [feature]"
```

### Planning & Research
```bash
# Sequential Thinking
"Use sequentialthinking to plan [complex task]"

# Fetch
"Fetch and summarize [URL]"
```

---

## Best Practices

1. **Use Descriptive Prompts**
   ✅ Good: "Use memory to create entity 'GymMember' with properties: id, name, subscriptionTier"
   ❌ Bad: "Store gym member data"

2. **Combine Servers Intentionally**
   - Memory Graph = Architecture map
   - Memory Keeper = Development journal
   - Context7 = Reference library

3. **Verify Before Acting**
   ```bash
   "First, check memory-keeper if we've done this before"
   "Use memory to see if this entity already exists"
   ```

4. **Session Management**
   ```bash
   # Start new feature work
   "Start session 'Workout Scheduler v2' in memory-keeper"

   # End of day
   "Create checkpoint in memory-keeper for today's progress"
   ```

5. **Project Isolation**
   Your config automatically isolates:
   - Memory files: new-nestjs-gym-app-{graph,memory}.db
   - Filesystem: Hardcoded to your project

---

## Troubleshooting

### Memory server not responding
```bash
# Check if server is running
"Use memory to list all entities"
# If fails, restart Cline
```

### Context7 returning old docs
```bash
"Use context7 to get fresh docs for [library]"
```

### Memory keeper not saving
```bash
"Show memory-keeper status"
"Check if STORAGE_PATH is correct"
```

### Too many results from memory
```bash
"Use memory to search for 'specific term'"
"Use memory-keeper to filter by date"
```

---

## Performance Tips

1. Limit memory entries: Your config has --max-entries 500
2. Auto-prune enabled: Old entries are automatically cleaned
3. Timeouts: 30s for memory servers, 60s for others
4. Batch operations: Use code-mode for complex multi-server tasks

---

## Daily Workflow Template

### Morning (Context Setup)
1. Use context7 to get latest NestJS patterns
2. Check memory-keeper for yesterday's progress

### Development (Active Work)
1. Use sequentialthinking to plan tasks
2. Use memory to store architecture decisions
3. Use filesystem to implement code
4. Use memory-keeper to log progress

### Review (End of Day)
1. Use memory to review architecture map
2. Store final decisions in memory-keeper
3. Create checkpoint for tomorrow

---

## Summary

You have a complete development ecosystem:

- **Memory**: Architecture & relationships
- **Keeper**: History & decisions
- **Context**: Documentation & research
- **Tools**: Files, mobile, fetch, orchestration
