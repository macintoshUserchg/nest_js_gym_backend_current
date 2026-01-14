# Claude Code MCP Tools & Plugins Usage Frequency Reference

This document lists all available MCP tools with estimated usage frequency indicators based on typical workflows.

---

## Usage Frequency Legend

| Indicator | Meaning |
|-----------|---------|
| 🔴 HIGH | Frequently used in daily development |
| 🟡 MEDIUM | Used occasionally for specific tasks |
| 🟢 LOW | Specialized tools for rare use cases |
| ⚪ N/A | Infrastructure/service tools |

---

## compound-engineering MCP Tools

### Context7 (Documentation Lookup)

| Tool | Frequency | Use Case |
|------|-----------|----------|
| `context7__resolve-library-id` | 🔴 HIGH | Find library documentation ID |
| `context7__query-docs` | 🔴 HIGH | Query documentation and examples |

### Playwright Browser Automation

| Tool | Frequency | Use Case |
|------|-----------|----------|
| `pw__browser_navigate` | 🟡 MEDIUM | Navigate to URLs |
| `pw__browser_snapshot` | 🟡 MEDIUM | Capture page accessibility tree |
| `pw__browser_click` | 🟡 MEDIUM | Click elements |
| `pw__browser_take_screenshot` | 🟡 MEDIUM | Take screenshots |
| `pw__browser_type` | 🟡 MEDIUM | Type text into fields |
| `pw__browser_fill_form` | 🟡 MEDIUM | Fill multiple form fields |
| `pw__browser_hover` | 🟢 LOW | Hover over elements |
| `pw__browser_press_key` | 🟢 LOW | Press keyboard keys |
| `pw__browser_select_option` | 🟢 LOW | Select dropdown options |
| `pw__browser_drag` | 🟢 LOW | Drag and drop |
| `pw__browser_handle_dialog` | 🟢 LOW | Handle alert/prompt dialogs |
| `pw__browser_file_upload` | 🟢 LOW | Upload files |
| `pw__browser_network_requests` | 🟢 LOW | Inspect network requests |
| `pw__browser_wait_for` | 🟢 LOW | Wait for text/elements |
| `pw__browser_evaluate` | 🟢 LOW | Run custom JavaScript |
| `pw__browser_run_code` | 🟢 LOW | Run Playwright code snippets |
| `pw__browser_resize` | 🟢 LOW | Resize browser window |
| `pw__browser_tabs` | 🟢 LOW | Manage browser tabs |
| `pw__browser_navigate_back` | 🟢 LOW | Go back in history |
| `pw__browser_install` | ⚪ N/A | Install browser binaries |

---

## memory-keeper MCP Tools

| Tool | Frequency | Use Case |
|------|-----------|----------|
| `memory__context_save` | 🟡 MEDIUM | Save context to memory |
| `memory__context_load` | 🟡 MEDIUM | Load context from memory |
| `memory__context_search_all` | 🟡 MEDIUM | Search all contexts |
| `memory__create_entities` | 🟢 LOW | Create memory entities |
| `memory__create_relations` | 🟢 LOW | Create entity relations |
| `memory__read_graph` | 🟢 LOW | Read memory graph |
| `memory__add_observations` | 🟢 LOW | Add observations to entities |
| `memory__delete_entities` | 🟢 LOW | Delete entities |
| `memory__delete_relations` | 🟢 LOW | Delete relations |
| `memory-keeper__context_session_start` | 🟢 LOW | Start context session |
| `memory-keeper__context_batch_save` | 🟢 LOW | Batch save contexts |
| `memory-keeper__context_batch_delete` | 🟢 LOW | Batch delete contexts |
| `memory-keeper__context_status` | 🟢 LOW | Check context status |
| `memory-keeper__context_summarize` | 🟢 LOW | Summarize context |

---

## fetch MCP Tools

| Tool | Frequency | Use Case |
|------|-----------|----------|
| `fetch__fetch_json` | 🔴 HIGH | Fetch JSON from URL |
| `fetch__fetch` | 🔴 HIGH | Fetch and process web content |

---

## Task Agents (Subagent Types)

### Core Agents

| Agent | Frequency | Use Case |
|-------|-----------|----------|
| `Explore` | 🔴 HIGH | Fast codebase exploration |
| `Plan` | 🔴 HIGH | Implementation planning |
| `general-purpose` | 🟡 MEDIUM | Research and multi-step tasks |
| `claude-code-guide` | 🟢 LOW | Claude Code usage guidance |
| `statusline-setup` | ⚪ N/A | Status line configuration |

### Backend Development Agents

| Agent | Frequency | Use Case |
|-------|-----------|----------|
| `backend-architect` | 🟡 MEDIUM | API and microservices design |
| `graphql-architect` | 🟢 LOW | GraphQL architecture |
| `microservices-patterns` | 🟢 LOW | Microservices patterns |
| `cqrs-implementation` | 🟢 LOW | CQRS design |
| `saga-orchestration` | 🟢 LOW | Saga patterns |
| `workflow-orchestration-patterns` | 🟢 LOW | Workflow design |
| `event-sourcing-architect` | 🟢 LOW | Event sourcing |
| `event-store-design` | 🟢 LOW | Event store design |
| `projection-patterns` | 🟢 LOW | Projection patterns |
| `tdd-orchestrator` | 🟢 LOW | TDD workflow |
| `temporal-python-pro` | 🟢 LOW | Temporal workflows |

### Code Review Agents

| Agent | Frequency | Use Case |
|-------|-----------|----------|
| `code-reviewer` | 🔴 HIGH | General code review |
| `security-sentinel` | 🟡 MEDIUM | Security audits |
| `performance-oracle` | 🟡 MEDIUM | Performance review |
| `architecture-strategist` | 🟡 MEDIUM | Architecture review |
| `pattern-recognition-specialist` | 🟡 MEDIUM | Pattern analysis |
| `code-simplicity-reviewer` | 🟢 LOW | Simplification review |
| `agent-native-reviewer` | 🟢 LOW | Agent accessibility |
| `dhh-rails-reviewer` | 🟢 LOW | Rails conventions |
| `kieran-rails-reviewer` | 🟢 LOW | Rails strict review |
| `kieran-python-reviewer` | 🟢 LOW | Python strict review |
| `kieran-typescript-reviewer` | 🟢 LOW | TypeScript strict review |
| `julik-frontend-races-reviewer` | 🟢 LOW | Race condition detection |
| `data-integrity-guardian` | 🟢 LOW | Database integrity |
| `data-migration-expert` | 🟢 LOW | Migration safety |
| `deployment-verification-agent` | 🟢 LOW | Deployment checks |

### Compound Engineering Agents

| Agent | Frequency | Use Case |
|-------|-----------|----------|
| `design-implementation-reviewer` | 🟡 MEDIUM | Design verification |
| `design-iterator` | 🟢 LOW | Iterative design |
| `figma-design-sync` | 🟢 LOW | Figma sync |
| `best-practices-researcher` | 🟡 MEDIUM | Best practices research |
| `framework-docs-researcher` | 🟡 MEDIUM | Framework documentation |
| `repo-research-analyst` | 🟡 MEDIUM | Repo analysis |
| `git-history-analyzer` | 🟢 LOW | Git history analysis |
| `bug-reproduction-validator` | 🟡 MEDIUM | Bug reproduction |
| `spec-flow-analyzer` | 🟢 LOW | User flow analysis |
| `every-style-editor` | 🟢 LOW | Style compliance |
| `pr-comment-resolver` | 🟢 LOW | PR comment resolution |
| `lint` | 🟢 LOW | Ruby/ERB linting |

### Agent SDK Verification

| Agent | Frequency | Use Case |
|-------|-----------|----------|
| `agent-sdk-verifier-ts` | 🟢 LOW | TypeScript SDK verification |
| `agent-sdk-verifier-py` | 🟢 LOW | Python SDK verification |

---

## Skills (User-Invocable)

### Agent SDK Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `agent-sdk-dev:new-sdk-app` | 🟢 LOW | Create SDK app |

### Backend Development Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `backend-development:api-design-principles` | 🟡 MEDIUM | API design guidance |
| `backend-development:architecture-patterns` | 🟡 MEDIUM | Architecture patterns |
| `backend-development:microservices-patterns` | 🟢 LOW | Microservices patterns |
| `backend-development:cqrs-implementation` | 🟢 LOW | CQRS patterns |
| `backend-development:saga-orchestration` | 🟢 LOW | Saga patterns |
| `backend-development:workflow-orchestration-patterns` | 🟢 LOW | Workflow patterns |
| `backend-development:event-store-design` | 🟢 LOW | Event store patterns |
| `backend-development:projection-patterns` | 🟢 LOW | Projection patterns |
| `backend-development:temporal-python-testing` | 🟢 LOW | Temporal testing |

### Code Review Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `code-review:code-review` | 🔴 HIGH | PR code review |

### Compound Engineering Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `compound-engineering:plan_review` | 🔴 HIGH | Multi-agent plan review |
| `compound-engineering:workflows:work` | 🔴 HIGH | Execute work plans |
| `compound-engineering:workflows:plan` | 🟡 MEDIUM | Transform to plans |
| `compound-engineering:workflows:review` | 🟡 MEDIUM | Multi-agent review |
| `compound-engineering:create-agent-skill` | 🟡 MEDIUM | Create skills |
| `compound-engineering:resolve_parallel` | 🟡 MEDIUM | Parallel resolution |
| `compound-engineering:resolve_todo_parallel` | 🟡 MEDIUM | Resolve TODOs |
| `compound-engineering:resolve_pr_parallel` | 🟡 MEDIUM | Resolve PR comments |
| `compound-engineering:deepen-plan` | 🟢 LOW | Enhance plans |
| `compound-engineering:compound-docs` | 🟢 LOW | Document solutions |
| `compound-engineering:reproduce-bug` | 🟢 LOW | Reproduce bugs |
| `compound-engineering:triage` | 🟢 LOW | Triage findings |
| `compound-engineering:agent-native-audit` | 🟢 LOW | Agent-native audit |
| `compound-engineering:dhh-rails-style` | 🟢 LOW | Rails style |
| `compound-engineering:dspy-ruby` | 🟢 LOW | DSPy.rb |
| `compound-engineering:every-style-editor` | 🟢 LOW | Style editing |
| `compound-engineering:feature-video` | 🟢 LOW | Record video |
| `compound-engineering:file-todos` | 🟢 LOW | File-based todos |
| `compound-engineering:generate_command` | 🟢 LOW | Generate commands |
| `compound-engineering:heal-skill` | 🟢 LOW | Fix skill files |
| `compound-engineering:deploy-docs` | 🟢 LOW | Deploy docs |
| `compound-engineering:release-docs` | 🟢 LOW | Release docs |
| `compound-engineering:report-bug` | 🟢 LOW | Report bugs |
| `compound-engineering:changelog` | 🟢 LOW | Generate changelog |
| `compound-engineering:xcode-test` | 🟢 LOW | iOS testing |

### Feature Development Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `feature-dev:code-architect` | 🟡 MEDIUM | Feature architecture |
| `feature-dev:code-explorer` | 🟡 MEDIUM | Feature analysis |
| `feature-dev:code-reviewer` | 🟡 MEDIUM | Feature review |

### Frontend Design Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `frontend-design:frontend-design` | 🟡 MEDIUM | Frontend development |

### Hookify Skills

| Skill | Frequency | Use Case |
|-------|-----------|----------|
| `hookify:list` | 🟡 MEDIUM | List hooks |
| `hookify:configure` | 🟡 MEDIUM | Configure hooks |
| `hookify:help` | 🟢 LOW | Get help |
| `hookify:hookify` | 🟢 LOW | Create hooks |
| `hookify:writing-rules` | 🟢 LOW | Write rules |

---

## Quick Reference: Most Used Tools

### Daily Drivers 🔴 HIGH

| Category | Tools |
|----------|-------|
| Documentation | `context7__resolve-library-id`, `context7__query-docs` |
| Fetch | `fetch__fetch_json`, `fetch__fetch` |
| Exploration | `Explore` (agent) |
| Planning | `Plan` (agent) |
| Code Review | `code-reviewer` (agent), `code-review:code-review` (skill) |
| Workflows | `compound-engineering:plan_review`, `compound-engineering:workflows:work` |

### Occasional Use 🟡 MEDIUM

| Category | Tools |
|----------|-------|
| Browser | `pw__browser_navigate`, `pw__browser_snapshot`, `pw__browser_click` |
| Memory | `memory__context_save`, `memory__context_load`, `memory__context_search_all` |
| Firebase | `firebase__firebase_get_environment` |
| Security Review | `security-sentinel` (agent) |
| Performance | `performance-oracle` (agent) |
| Architecture | `architecture-strategist` (agent) |
| Design Review | `design-implementation-reviewer` (agent) |
| Research | `best-practices-researcher`, `framework-docs-researcher`, `repo-research-analyst` |
| Bug Work | `bug-reproduction-validator` (agent) |
| Hooks | `hookify:list`, `hookify:configure` |

### Specialized Use 🟢 LOW

All remaining tools are specialized for specific scenarios (migrations, framework-specific reviews, SDK verification, etc.)

---

## Summary Stats

| Category | Total | HIGH | MEDIUM | LOW | N/A |
|----------|-------|------|--------|-----|-----|
| Context7 Tools | 2 | 2 | 0 | 0 | 0 |
| Playwright Tools | 20 | 0 | 6 | 13 | 1 |
| Memory Tools | 14 | 0 | 3 | 11 | 0 |
| Fetch Tools | 2 | 2 | 0 | 0 | 0 |
| Core Agents | 5 | 2 | 1 | 2 | 0 |
| Backend Agents | 11 | 0 | 1 | 10 | 0 |
| Code Review Agents | 17 | 1 | 4 | 12 | 0 |
| Compound Eng Agents | 13 | 0 | 6 | 7 | 0 |
| SDK Verification Agents | 2 | 0 | 0 | 2 | 0 |
| Agent SDK Skills | 1 | 0 | 0 | 1 | 0 |
| Backend Skills | 9 | 0 | 2 | 7 | 0 |
| Code Review Skills | 1 | 1 | 0 | 0 | 0 |
| Compound Eng Skills | 26 | 2 | 8 | 16 | 0 |
| Feature Dev Skills | 3 | 0 | 3 | 0 | 0 |
| Frontend Skills | 1 | 0 | 1 | 0 | 0 |
| Hookify Skills | 5 | 0 | 2 | 3 | 0 |
| **TOTAL** | **132** | **8** | **37** | **82 | **1** |

---

*Note: This is a reference guide based on typical usage patterns. Actual usage may vary based on your workflow and project needs.*
