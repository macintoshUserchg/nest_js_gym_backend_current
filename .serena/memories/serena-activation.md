# Serena Activation for new-nestjs-gym-app

**At the start of EVERY Claude Code session:**

1. First message should be: "Activate project new-nestjs-gym-app"
   OR
   Use the tool: `mcp__plugin_serena_serena__activate_project` with `{"project": "new-nestjs-gym-app"}`

**Project Details:**
- Name: `new-nestjs-gym-app`
- Path: `/Users/chandangaur/development/Nest JS/new-nestjs-gym-app`
- Active as of: 2026-01-19

**Why this is needed:**
Serena MCP server doesn't persist project activation across CLI sessions. Each new Claude Code session requires explicit activation.

**Quick activation command (if using MCP tools directly):**
```json
{
  "project": "new-nestjs-gym-app"
}
```

**Alternative (Serena switch_modes):**
Can also use `switch_modes` to ensure editing and interactive modes are active along with the project.
