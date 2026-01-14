# Claude Code Must-Use Tools & Skills

Essential tools, agents, and skills for efficient development with Claude Code.

---

## Quick Start

For most tasks, start with these:

| Tool | Command |
|------|---------|
| Explore codebase | `Explore` agent |
| Plan implementation | `Plan` agent |
| Code review | `/code-review:code-review` |
| Resolve TODOs | `/compound-engineering:resolve_todo_parallel` |

---

## Essential MCP Tools

### context7 - Documentation Lookup

```typescript
// Find library documentation ID
mcp__plugin_compound-engineering_context7__resolve-library-id({
  libraryName: "nestjs",
  query: "NestJS documentation for modules and controllers"
})

// Query documentation
mcp__plugin_compound-engineering_context7__query-docs({
  libraryId: "/nestjs/docs",
  query: "How to create a REST API controller"
})
```

**Use When**: Looking up framework docs, library APIs, or code examples.

---

### fetch - Web Content

```typescript
// Fetch JSON
mcp__fetch__fetch_json({
  url: "https://api.github.com/repos/nestjs/nest",
})

// Fetch and process web content
mcp__fetch__fetch({
  prompt: "Extract the main features from this documentation page",
  url: "https://docs.nestjs.com"
})
```

**Use When**: Fetching APIs, scraping docs, or retrieving external data.

---

### Playwright - Browser Automation

```typescript
// Navigate and take screenshot
mcp__plugin_compound-engineering_pw__browser_navigate({
  url: "http://localhost:3000/api"
})

mcp__plugin_compound-engineering_pw__browser_take_screenshot({
  filename: "api-docs.png"
})

// Capture page state
mcp__plugin_compound-engineering_pw__browser_snapshot()
```

**Use When**: Testing web apps, capturing UI states, verifying pages.

---

### memory-keeper - Context Persistence

```typescript
// Save context for later
mcp__memory__context_save({
  context: { task: "API design", status: "in_progress" }
})

// Search previous contexts
mcp__memory__context_search_all({
  query: "API design patterns"
})
```

**Use When**: Maintaining context across sessions or recalling previous work.

---

## Essential Task Agents

### Explore - Codebase Analysis

```bash
Task tool with:
  subagent_type: "Explore"
  prompt: "Find all REST controllers and their endpoints in this codebase"
```

**Use When**: Understanding codebase structure, finding, tracing specific patterns dependencies.

---

### Plan - Implementation Planning

```bash
Task tool with:
  subagent_type: "Plan"
  prompt: "Design a plan to add user authentication with JWT tokens"
```

**Use When**: Starting new features, designing architectures, breaking down tasks.

---

### code-reviewer - Code Quality

```bash
Task tool with:
  subagent_type: "code-reviewer"
  prompt: "Review the authentication module for security vulnerabilities"
```

**Use When**: Before merging PRs, checking code quality, finding bugs.

---

### security-sentinel - Security Audits

```bash
Task tool with:
  subagent_type: "security-sentinel"
  prompt: "Check the login endpoint for SQL injection and XSS vulnerabilities"
```

**Use When**: Reviewing auth code, payment flows, or sensitive endpoints.

---

## Essential Skills

### Planning & Workflow

| Skill | Usage |
|-------|-------|
| `/compound-engineering:plan_review` | Multi-agent review of your implementation plan |
| `/compound-engineering:workflows:plan` | Transform feature specs into detailed plans |
| `/compound-engineering:workflows:work` | Execute a work plan step by step |
| `/compound-engineering:deepen-plan` | Enhance plans with research |

**Usage**: `Skill tool with skill: "compound-engineering:plan_review"`

---

### Code Review

| Skill | Usage |
|-------|-------|
| `/code-review:code-review` | Comprehensive PR code review |
| `/feature-dev:code-reviewer` | Review a specific feature implementation |

---

### Bug Fixing

| Skill | Usage |
|-------|-------|
| `/compound-engineering:reproduce-bug` | Reproduce a bug systematically |
| `/compound-engineering:triage` | Triage and categorize issues |

---

### Todo Resolution

| Skill | Usage |
|-------|-------|
| `/compound-engineering:resolve_todo_parallel` | Resolve all TODO comments in parallel |
| `/compound-engineering:resolve_pr_parallel` | Resolve all PR comments in parallel |

---

### Code Quality

| Skill | Usage |
|-------|-------|
| `/backend-development:api-design-principles` | Get API design guidance |
| `/backend-development:architecture-patterns` | Architecture pattern recommendations |

---

## Decision Flowchart

```
What do you need?
        │
        ├─► Understand codebase
        │       └─► Use `Explore` agent
        │
        ├─► Plan new feature
        │       └─► Use `Plan` agent
        │
        ├─► Review code
        │       ├─► General review → `/code-review:code-review`
        │       ├─► Security → `security-sentinel` agent
        │       └─► Performance → `performance-oracle` agent
        │
        ├─► Fix TODOs
        │       └─► `/compound-engineering:resolve_todo_parallel`
        │
        ├─► Look up docs
        │       └─► `context7` MCP tools
        │
        ├─► Test web UI
        │       └─► Playwright MCP tools
        │
        └─► Save context
                └─► `memory-keeper` MCP tools
```

---

## Command Reference

### Task Agent Invocation

```typescript
Task tool with {
  subagent_type: "Explore | Plan | code-reviewer | security-sentinel | etc.",
  prompt: "Your specific task or question"
}
```

### Skill Invocation

```bash
Skill tool with skill: "skill-name"
```

### MCP Tool Invocation

```typescript
mcp__server__tool-name({ parameters })
```

---

## Top 10 Must-Use

1. **`Explore` agent** - Understand any codebase quickly
2. **`Plan` agent** - Design features with structured approach
3. **`/code-review:code-review`** - Review PRs before merging
4. **`context7__query-docs`** - Look up framework docs instantly
5. **`/compound-engineering:plan_review`** - Validate implementation plans
6. **`/compound-engineering:resolve_todo_parallel`** - Clear TODOs fast
7. **`security-sentinel` agent** - Catch security issues early
8. **`fetch__fetch_json`** - Fetch APIs and data
9. **`Playwright` MCP** - Test and verify web UIs
10. **`memory__context_save`** - Maintain context across sessions

---

## Pro Tips

- **Use `Explore` first** when joining a new project
- **Always use `Plan`** before implementing complex features
- **Run `code-reviewer`** before opening PRs
- **Keep context in `memory-keeper`** for long-running tasks
- **Use `context7`** instead of searching Google for docs
- **Run `security-sentinel`** on auth/payment code

---

*Last updated: 2025-01-14*
