# Claude Code Tools, Agents, and Plugins Reference

This document provides a comprehensive overview of all available MCP servers, task agents, and skills in Claude Code.

## MCP Servers

MCP (Model Context Protocol) servers provide specialized capabilities to Claude Code.

### compound-engineering

A powerful engineering toolkit with multiple capabilities:

- **Code Review**: Architecture, security, performance, patterns, simplicity
- **Planning**: Multi-agent workflow coordination
- **Research**: Best practices, documentation, git history, repo analysis
- **Design**: Figma sync, implementation review, iterative design
- **Deployment**: Verification, migration expert, data integrity
- **Documentation**: README writing, changelog generation

### memory-keeper

Context and memory persistence:

- Context save/load/search
- Session management
- Graph-based memory storage
- Entity and relation management

### context7

Documentation lookup for libraries/frameworks:

- Resolve library names to Context7 IDs
- Query documentation and code examples
- Support for major frameworks (React, Next.js, Supabase, MongoDB, etc.)

### fetch

Web content retrieval:

- Fetch URLs and process with AI
- HTML to markdown conversion
- PDF and image support
- 15-minute cache for performance

### plugin_compound-engineering_pw

Playwright browser automation:

- Navigation and screenshot capture
- Form filling and submission
- Element interaction (click, hover, drag, type)
- Dialog handling
- File upload/download
- Network request inspection
- Browser installation

---

## Task Agents

Task agents are specialized subagents launched via the `Task` tool for complex, multi-step autonomous tasks.

### Core Agents

| Agent | Description |
|-------|-------------|
| `general-purpose` | Research and multi-step task execution |
| `Explore` | Fast codebase exploration for files and patterns |
| `Plan` | Software architecture and implementation planning |
| `claude-code-guide` | Claude Code CLI usage and SDK guidance |
| `statusline-setup` | Status line configuration |

### Backend Development Agents

| Agent | Description |
|-------|-------------|
| `backend-architect` | Scalable API design, microservices, distributed systems |
| `graphql-architect` | GraphQL federation, caching, real-time systems |
| `event-sourcing-architect` | Event sourcing patterns and implementation |
| `tdd-orchestrator` | Test-driven development workflow management |
| `temporal-python-pro` | Temporal workflow orchestration (Python SDK) |
| `microservices-patterns` | Service boundaries, event-driven communication |
| `cqrs-implementation` | Command Query Responsibility Segregation |
| `saga-orchestration` | Distributed transactions and compensating workflows |
| `workflow-orchestration-patterns` | Durable workflows with Temporal |
| `projection-patterns` | Read models and materialized views |
| `event-store-design` | Event persistence and event-sourced systems |

### Code Review Agents

| Agent | Description |
|-------|-------------|
| `code-reviewer` | Comprehensive code quality review |
| `security-sentinel` | Security audits, vulnerability assessment |
| `performance-oracle` | Performance optimization and bottlenecks |
| `pattern-recognition-specialist` | Design patterns and anti-patterns |
| `code-simplicity-reviewer` | YAGNI principles and simplification |
| `agent-native-reviewer` | Agent accessibility verification |
| `architecture-strategist` | Architectural compliance review |
| `dhh-rails-reviewer` | DHH/Basecamp Rails conventions |
| `kieran-rails-reviewer` | Strict Rails quality standards |
| `kieran-python-reviewer` | Strict Python conventions |
| `kieran-typescript-reviewer` | Strict TypeScript conventions |
| `julik-frontend-races-reviewer` | Frontend race condition detection |
| `data-integrity-guardian` | Database migration and data integrity |
| `data-migration-expert` | Data migration safety and ID mappings |
| `deployment-verification-agent` | Deployment checklists and rollback plans |

### Compound Engineering Agents

| Agent | Description |
|-------|-------------|
| `design-implementation-reviewer` | Figma design verification |
| `design-iterator` | Iterative design improvement |
| `figma-design-sync` | Figma to code synchronization |
| `best-practices-researcher` | Industry best practices research |
| `framework-docs-researcher` | Framework documentation lookup |
| `git-history-analyzer` | Commit history and code evolution |
| `repo-research-analyst` | Repository structure and patterns |
| `bug-reproduction-validator` | Bug reproduction and validation |
| `spec-flow-analyzer` | User flow and requirement gap analysis |
| `every-style-editor` | Every's editorial style compliance |
| `pr-comment-resolver` | PR comment resolution workflow |
| `lint` | Ruby and ERB linting |

### Agent SDK Verification Agents

| Agent | Description |
|-------|-------------|
| `agent-sdk-verifier-ts` | TypeScript Agent SDK verification |
| `agent-sdk-verifier-py` | Python Agent SDK verification |

---

## Skills

Skills are user-invocable capabilities prefixed with `/`. Invoke using the `Skill` tool.

### Agent SDK Skills

| Skill | Description |
|-------|-------------|
| `agent-sdk-dev:new-sdk-app` | Create and setup a new Claude Agent SDK application |

### Backend Development Skills

| Skill | Description |
|-------|-------------|
| `backend-development:api-design-principles` | REST and GraphQL API design mastery |
| `backend-development:architecture-patterns` | Clean/Hexagonal Architecture, DDD |
| `backend-development:cqrs-implementation` | CQRS implementation patterns |
| `backend-development:event-store-design` | Event store design for event sourcing |
| `backend-development:microservices-patterns` | Microservices architecture patterns |
| `backend-development:projection-patterns` | Read model and projection patterns |
| `backend-development:saga-orchestration` | Saga pattern for distributed transactions |
| `backend-development:temporal-python-testing` | Temporal workflow testing strategies |
| `backend-development:workflow-orchestration-patterns` | Durable workflow design |

### Code Review Skills

| Skill | Description |
|-------|-------------|
| `code-review:code-review` | Comprehensive PR code review |

### Compound Engineering Skills

| Skill | Description |
|-------|-------------|
| `compound-engineering:agent-native-audit` | Agent-native architecture review |
| `compound-engineering:changelog` | Generate changelogs from merges |
| `compound-engineering:compound-docs` | Document solved problems with YAML frontmatter |
| `compound-engineering:create-agent-skill` | Create/edit Claude Code skills |
| `compound-engineering:create-agent-skills` | Expert skill creation guidance |
| `compound-engineering:deepen-plan` | Enhance plans with research agents |
| `compound-engineering:deploy-docs` | Validate GitHub Pages deployment |
| `compound-engineering:dhh-rails-style` | DHH/Basecamp Ruby on Rails style |
| `compound-engineering:dspy-ruby` | DSPy.rb for type-safe LLM apps |
| `compound-engineering:every-style-editor` | Every's style guide compliance |
| `compound-engineering:feature-video` | Record feature walkthrough videos |
| `compound-engineering:file-todos` | File-based todo tracking system |
| `compound-engineering:generate_command` | Create custom slash commands |
| `compound-engineering:heal-skill` | Fix incorrect SKILL.md files |
| `compound-engineering:plan_review` | Multi-agent plan review |
| `compound-engineering:release-docs` | Build documentation site |
| `compound-engineering:report-bug` | Report plugin bugs |
| `compound-engineering:reproduce-bug` | Reproduce bugs with browser/tools |
| `compound-engineering:resolve_parallel` | Resolve TODO comments in parallel |
| `compound-engineering:resolve_pr_parallel` | Resolve PR comments in parallel |
| `compound-engineering:resolve_todo_parallel` | Resolve CLI todos in parallel |
| `compound-engineering:triage` | Triage CLI todo findings |
| `compound-engineering:xcode-test` | iOS app build and test |
| `compound-engineering:workflows:compound` | Document solved problems |
| `compound-engineering:workflows:plan` | Transform features into plans |
| `compound-engineering:workflows:review` | Multi-agent code review |
| `compound-engineering:workflows:work` | Execute work plans |

### Feature Development Skills

| Skill | Description |
|-------|-------------|
| `feature-dev:code-architect` | Feature architecture design |
| `feature-dev:code-explorer` | Deep feature analysis |
| `feature-dev:code-reviewer` | Feature code quality review |

### Frontend Design Skills

| Skill | Description |
|-------|-------------|
| `frontend-design:frontend-design` | Production-grade frontend interfaces |

### Hookify Skills

| Skill | Description |
|-------|-------------|
| `hookify:configure` | Configure hookify rules |
| `hookify:help` | Hookify help and guidance |
| `hookify:hookify` | Create hooks from behaviors |
| `hookify:list` | List configured hooks |
| `hookify:writing-rules` | Hook rule syntax guidance |

---

## Plugins

Plugins extend Claude Code's capabilities.

### Official Plugins

| Plugin | Description |
|--------|-------------|
| `compound-engineering@every-marketplace` | Comprehensive engineering toolkit |
| `agent-sdk-dev@claude-plugins-official` | Claude Agent SDK development |
| `code-review@claude-plugins-official` | Code review automation |
| `frontend-design@claude-plugins-official` | Frontend design and development |
| `backend-development@claude-code-workflows` | Backend architecture patterns |
| `hookify@claude-plugins-official` | Conversation behavior hooks |

### MCP Plugins

| Plugin | Description |
|--------|-------------|
| `memory-keeper` | Context/memory persistence |
| `context7` | Documentation lookup |
| `fetch` | Web content fetching |

---

## Usage Examples

### Using Task Agents

```typescript
// Launch exploration agent
Task tool with subagent_type: 'Explore', prompt: 'Find all REST controllers'

// Launch planning agent
Task tool with subagent_type: 'Plan', prompt: 'Design a user authentication system'
```

### Invoking Skills

```bash
# Using Skill tool
Skill tool with skill: 'compound-engineering:plan_review'

# With arguments
Skill tool with skill: 'agent-sdk-dev:new-sdk-app', args: '--name my-agent'
```

### MCP Tool Usage

```typescript
// Fetch documentation
mcp__plugin_compound-engineering_context7__query-docs({
  libraryId: '/org/project',
  query: 'How to implement authentication'
})

// Browser automation
mcp__plugin_compound-engineering_pw__browser_navigate({ url: 'https://example.com' })
```

---

## Quick Reference

### Most Used MCP Tools

| Tool | Purpose |
|------|---------|
| `context7__query-docs` | Get framework documentation |
| `context7__resolve-library-id` | Find library documentation |
| `pw__browser_snapshot` | Capture page state |
| `pw__browser_click` | Click elements |

### Essential Agents

- **Quick tasks**: `Explore`
- **Planning**: `Plan`
- **Code review**: `code-reviewer` or `security-sentinel`
- **Architecture**: `architecture-strategist`

### Common Skills

- `/compound-engineering:plan_review` - Review implementation plans
- `/compound-engineering:workflows:work` - Execute work plans
- `/hookify:configure` - Configure behavior hooks
