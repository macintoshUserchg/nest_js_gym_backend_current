# Claude Code Redundant & Overlapping Tools Guide

This document groups tools, agents, and skills that perform similar or overlapping operations, helping you choose the right tool for your task.

---

## 1. Code Review (Agents & Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **General Review** | `code-reviewer` (agent), `code-review:code-review` (skill) | Comprehensive code quality review for any language |
| **Architecture** | `architecture-strategist` (agent), `agent-native-reviewer` (agent) | Architectural compliance and agent accessibility |
| **Rails-specific** | `dhh-rails-reviewer` (agent), `kieran-rails-reviewer` (agent) | DHH conventions vs strict quality standards for Rails |
| **Python-specific** | `kieran-python-reviewer` (agent) | Strict Python conventions (no Python equivalent for other frameworks) |
| **TypeScript-specific** | `kieran-typescript-reviewer` (agent) | Strict TypeScript conventions |
| **Security** | `security-sentinel` (agent) | Security audits and vulnerability assessment |
| **Performance** | `performance-oracle` (agent) | Performance optimization and bottlenecks |
| **Patterns** | `pattern-recognition-specialist` (agent) | Design patterns and anti-patterns detection |

**Recommendation**: Use `code-reviewer` for general reviews, `security-sentinel` for security, and framework-specific reviewers for framework-focused code.

---

## 2. Documentation & Research (MCP + Agents + Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **Framework Docs** | `context7` (MCP), `framework-docs-researcher` (agent) | Look up official framework documentation |
| **Best Practices** | `best-practices-researcher` (agent), `compound-engineering:deepen-plan` (skill) | Research industry best practices |
| **Repo Analysis** | `repo-research-analyst` (agent), `Explore` (agent) | Analyze repository structure and patterns |
| **Git History** | `git-history-analyzer` (agent) | Analyze commit history and code evolution |

**Recommendation**: Use `context7` for official docs, `Explore` for quick codebase searches, `repo-research-analyst` for deep repo analysis.

---

## 3. Planning & Workflow (Agents & Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **Planning** | `Plan` (agent), `backend-architect` (agent), `feature-dev:code-architect` (skill) | Design implementation approaches |
| **Work Execution** | `compound-engineering:workflows:work` (skill), `general-purpose` (agent) | Execute multi-step tasks |
| **Plan Review** | `compound-engineering:plan_review` (skill), `compound-engineering:workflows:plan` (skill) | Review and refine plans |
| **Multi-agent** | `compound-engineering:workflows:review` (skill), `tdd-orchestrator` (agent) | Coordinate multiple agents |

**Recommendation**: Use `Plan` agent for initial design, `compound-engineering:workflows:work` for execution.

---

## 4. Backend Patterns (Agents & Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **CQRS** | `cqrs-implementation` (agent), `backend-development:cqrs-implementation` (skill) | Separate read/write models |
| **Event Sourcing** | `event-sourcing-architect` (agent), `event-store-design` (agent), `backend-development:event-store-design` (skill) | Event-sourced architecture |
| **Microservices** | `microservices-patterns` (agent), `backend-development:microservices-patterns` (skill) | Distributed service architecture |
| **Saga Orchestration** | `saga-orchestration` (agent), `backend-development:saga-orchestration` (skill) | Distributed transactions |
| **Workflows** | `workflow-orchestration-patterns` (agent), `backend-development:workflow-orchestration-patterns` (skill) | Durable workflow design |
| **Projections** | `projection-patterns` (agent), `backend-development:projection-patterns` (skill) | Read models and materialized views |
| **Temporal** | `temporal-python-pro` (agent), `backend-development:temporal-python-testing` (skill) | Temporal workflow orchestration |

**Recommendation**: Agents provide architecture design, skills provide implementation patterns.

---

## 5. Bug & Issue Handling (Agents & Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **Bug Reproduction** | `bug-reproduction-validator` (agent), `compound-engineering:reproduce-bug` (skill) | Reproduce and validate reported bugs |
| **Data Migration** | `data-migration-expert` (agent), `data-integrity-guardian` (agent) | Safe database migrations |
| **Deployment** | `deployment-verification-agent` (agent) | Deployment checklists and rollback plans |

**Recommendation**: Use `bug-reproduction-validator` for bug reports, `data-migration-expert` for migrations.

---

## 6. Todo/Comment Resolution (Skills)

| Group | Items | Use Case |
|-------|-------|----------|
| **Parallel Resolution** | `compound-engineering:resolve_parallel` (skill), `resolve_pr_parallel` (skill), `resolve_todo_parallel` (skill) | Resolve comments/todos in parallel |
| **Triage** | `compound-engineering:triage` (skill) | Categorize CLI todo findings |

**Recommendation**: Use `resolve_todo_parallel` for TODOs, `resolve_pr_parallel` for PR comments.

---

## 7. Design & Frontend (Agent + Skills + Plugin)

| Group | Items | Use Case |
|-------|-------|----------|
| **Frontend Design** | `frontend-design:frontend-design` (skill), `frontend-design@claude-plugins-official` (plugin) | Production-grade frontend interfaces |
| **Design Verification** | `design-implementation-reviewer` (agent), `figma-design-sync` (agent), `design-iterator` (agent) | Verify/improve design implementation |

**Recommendation**: Use `frontend-design:frontend-design` for building UIs, `design-iterator` for iterative improvements.

---

## 8. Agent SDK Verification (Agents)

| Group | Items | Use Case |
|-------|-------|----------|
| **TypeScript SDK** | `agent-sdk-verifier-ts` (agent) | Verify TypeScript Agent SDK apps |
| **Python SDK** | `agent-sdk-verifier-py` (agent) | Verify Python Agent SDK apps |

**Recommendation**: Match agent to your SDK language.

---

## 9. Hookify Management (Skills)

| Items | Use Case |
|-------|----------|
| `hookify:configure` | Configure hookify rules |
| `hookify:hookify` | Create hooks from behaviors |
| `hookify:list` | List configured hooks |
| `hookify:help` | Get help |
| `hookify:writing-rules` | Learn rule syntax |

**Recommendation**: Start with `hookify:list` to see existing hooks, `hookify:configure` to add new ones.

---

## 10. Context & Memory (MCP)

| Items | Use Case |
|-------|----------|
| `memory-keeper` (MCP) | Context persistence, session management, graph-based memory |

**Use When**: You need to save context across sessions or maintain memory relationships.

---

## 11. Browser Automation (MCP)

| Tool Namespace | Items |
|----------------|-------|
| `plugin_compound-engineering_pw` | All Playwright tools: `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_screenshot`, `browser_type`, `browser_fill_form`, etc. |

**Use When**: Automating browser interactions, testing web apps, taking screenshots.

---

## Quick Decision Guide

| Task | Recommended Tool |
|------|------------------|
| Code review (general) | `code-reviewer` (agent) |
| Code review (security) | `security-sentinel` (agent) |
| Find framework docs | `context7` (MCP) |
| Explore codebase | `Explore` (agent) |
| Plan feature | `Plan` (agent) |
| Execute work plan | `compound-engineering:workflows:work` |
| Design backend architecture | `backend-architect` (agent) |
| Reproduce bug | `bug-reproduction-validator` (agent) |
| Build frontend UI | `frontend-design:frontend-design` |
| Verify Agent SDK app | `agent-sdk-verifier-ts` or `agent-sdk-verifier-py` |
| Configure hooks | `hookify:configure` |
| Automate browser | `plugin_compound-engineering_pw` (MCP) |
| Save context/memory | `memory-keeper` (MCP) |
| Resolve multiple TODOs | `compound-engineering:resolve_todo_parallel` |
| Review plans | `compound-engineering:plan_review` |

---

## Overlap Summary

| Area | Overlapping Items | Best Choice |
|------|-------------------|-------------|
| General code review | `code-reviewer`, `code-review:code-review` | `code-reviewer` (agent) |
| Docs lookup | `context7`, `framework-docs-researcher` | `context7` (MCP) |
| Repo exploration | `Explore`, `repo-research-analyst` | `Explore` (agent) |
| Planning | `Plan`, `backend-architect`, `feature-dev:code-architect` | `Plan` (agent) |
| Backend patterns | Multiple agents + skills | Use agents for design, skills for patterns |
| Bug reproduction | `bug-reproduction-validator`, `reproduce-bug` | `bug-reproduction-validator` (agent) |
| Parallel resolution | Multiple `resolve_*` skills | Match to task type |
