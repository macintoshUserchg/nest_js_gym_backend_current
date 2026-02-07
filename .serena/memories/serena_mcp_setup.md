# Serena MCP Setup for new-nestjs-gym-app

## Status: ✅ ACTIVE (February 7, 2026)

Serena MCP server is properly configured and running for this project.

## Configuration Files

### 1. Project Config (`.serena/project.yml`)
- **Project Name**: `new-nestjs-gym-app`
- **Language**: TypeScript
- **Encoding**: UTF-8
- **Base Modes**: (empty)
- **Default Modes**: (empty)

### 2. Global Config (`~/.serena/serena_config.yml`)
- **Language Backend**: LSP
- **Web Dashboard**: Enabled (http://127.0.0.1:24282/dashboard/index.html)
- **Log Level**: INFO
- **Registered Projects**: 
  - `/Users/chandangaur/development/Flutter Development/gym_mgmt`
  - `/Users/chandangaur/development/Nest JS/new-nestjs-gym-app`

### 3. MCP Config (`.claude/mcp.json`)
```json
{
  "mcpServers": {
    "serena": {
      "command": "/Users/chandangaur/Library/Python/3.11/bin/serena-mcp-server",
      "args": ["--project", "/Users/chandangaur/development/Nest JS/new-nestjs-gym-app"],
      "disabled": false
    }
  }
}
```

## Installation

### Serena Agent (via pip3.11)
- **Package**: `serena-agent 0.1.4`
- **Location**: `/Users/chandangaur/Library/Python/3.11/lib/python/site-packages/`
- **Binaries**: 
  - `/Users/chandangaur/Library/Python/3.11/bin/serena`
  - `/Users/chandangaur/Library/Python/3.11/bin/serena-mcp-server`

### Python
- **Version**: Python 3.11.7
- **Location**: `/opt/homebrew/opt/python@3.11/bin/python3.11`

## Usage

### Starting Serena MCP Server

#### Via uvx (Recommended)
```bash
uvx --from git+https://github.com/oraios/serena serena start-mcp-server \
  --project "/Users/chandangaur/development/Nest JS/new-nestjs-gym-app"
```

#### Via installed binary
```bash
/Users/chandangaur/Library/Python/3.11/bin/serena start-mcp-server \
  --project "/Users/chandangaur/development/Nest JS/new-nestjs-gym-app"
```

#### Via MCP Client
When configured in `.claude/mcp.json`, the MCP server is launched automatically by the client (Claude Desktop, VSCode, Cursor, etc.)

### Web Dashboard
- **URL**: http://127.0.0.1:24282/dashboard/index.html
- **Port**: 24282 (may increment for multiple instances)
- **Features**:
  - Current configuration
  - Active tools (29 tools)
  - Session logs
  - Tool usage statistics

## Available Tools

### Symbolic Operations
- `find_symbol` - Find classes/methods by name (semantic, not grep)
- `find_referencing_symbols` - Find all usages of a symbol
- `replace_symbol_body` - Replace entire method/function body
- `rename_symbol` - Rename across entire codebase
- `insert_after_symbol` - Insert code after a symbol
- `insert_before_symbol` - Insert code before a symbol

### File Operations
- `read_file` - Read file contents
- `create_text_file` - Create/overwrite file
- `list_dir` - List directory contents
- `find_file` - Find files by mask
- `replace_content` - Regex-based content replacement

### Memory Operations
- `read_memory` - Read project memory
- `list_memories` - List all memories
- `write_memory` - Write new memory
- `edit_memory` - Edit existing memory
- `delete_memory` - Delete memory

### Search & Analysis
- `search_for_pattern` - Pattern search across project
- `get_symbols_overview` - Get structure of any file

### Project Management
- `activate_project` - Activate a Serena project
- `get_current_config` - Get current configuration
- `check_onboarding_performed` - Check if onboarding done
- `onboarding` - Run project onboarding
- `switch_modes` - Switch operation modes

### Shell
- `execute_shell_command` - Run shell commands

## Project Memories (7 total)

1. **api_reference** - Complete API documentation with all endpoints
2. **suggested_commands** - Development, testing, and git commands
3. **postman-collection-populator-setup** - Postman automation setup
4. **style_and_conventions** - Coding patterns and naming conventions
5. **postman-workflow-status** - Current status of Postman workflow
6. **optimized_plan_run-single** - Performance optimization plan
7. **project_info** - Project architecture, entities, and features

## Activation Workflow

1. MCP client reads `.claude/mcp.json`
2. Launches `serena-mcp-server` with project path
3. Server starts on stdio (for MCP communication)
4. Web dashboard opens on http://127.0.0.1:24282
5. Tools become available in the conversation

## Serena Context & Modes

### Active Modes (after activation)
- **editing** - Code modifications enabled
- **interactive** - Conversational assistance

### Context
- Desktop application context
- Chat interface separated from codebase
- High-level thinking and planning required

## Key Benefits

1. **Semantic Code Operations** - Works at symbol level (classes, methods) not text
2. **LSP Integration** - TypeScript language server for accurate code understanding
3. **Project Memory** - Persistent context across sessions
4. **Symbol-based Refactoring** - Safe rename operations with reference tracking
5. **Smart Search** - Find symbols by name pattern, not grep

## Documentation

- **GitHub**: https://github.com/oraios/serena
- **Docs**: https://oraios.github.io/serena/
- **Dashboard**: http://127.0.0.1:24282/dashboard/index.html (when running)

## Setup Date
February 7, 2026

## Last Updated
February 7, 2026
