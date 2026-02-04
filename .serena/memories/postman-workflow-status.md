# Postman Collection Populator - Workflow Status

## Status: ✅ WORKING (as of Feb 4, 2026)

The `/run-single` command is fully operational after fixing bash permission issues.

## Working Commands

### Run Single Endpoint
```bash
/run-single <endpoint name>
```

Examples:
- `/run-single Get all gyms`
- `/run-single Get all members`
- `/run-single Delete a gym`

### Pipeline Commands
- `/run-single <endpoint name>` - Run single endpoint with full pipeline
- `/populate-all` - Run ALL endpoints in dependency order

### Info Commands
- `/status` - Check server status
- `/endpoints` - Show all available commands
- `/token` - Get fresh JWT token

## Successfully Tested Endpoints

| Endpoint | Status | Result |
|----------|--------|--------|
| Get all gyms | ✅ Working | Returns 1 gym (after deletion) |
| Get all members | ✅ Working | Returns members with nested data |
| Delete a gym | ✅ Working | Successfully deleted test gym |

## Current Database State

### Gyms
- **Fitness First Elite** (gymId: 6a0192f3-8b20-47e6-ba0d-1de5057a15b1)
  - Downtown Branch (main)
  - Beverly Hills Branch
  - Santa Monica Branch
  - Pasadena Branch

### Members
- Multiple seeded members with subscriptions
- All linked to branches

## Important Notes

### Bash Permission Fix
The `!` character in passwords was causing bash permission errors. Fixed by:
1. Updating `.claude/commands/run-single.md` to use `Admin123` instead of `Admin123!`
2. Using heredoc approach for actual API calls that require the real password

### Correct Endpoint Names
Use full descriptive names from dep-graph.json:
- ✅ "Get all gyms" (not "Get Gyms" or "get gyms")
- ✅ "Get all members" (not "Get Members")
- ✅ "Delete a gym" (not "Delete Gym")

## Files Created
- `postman/populated-collection.json` - Import this into Postman Desktop
- `postman/captured-responses.json` - Runtime state for dependent endpoints

## Next Steps
- Run `/run-single` with data reuse enabled (automatic for Gyms, Branches, Trainers)
- Use `--interactive` flag for prompt-based data selection
- Run `/populate-all` to populate all 285+ endpoints
- Import `postman/populated-collection.json` into Postman Desktop

---

## Pipeline Enhancements (Feb 4, 2026)

### Data Reuse System
The pipeline now supports intelligent data reuse:

**Entities with Reuse Enabled:**
- Gym (default: query)
- Branch (default: query)
- Trainer (default: query)
- WorkoutTemplate (default: query)
- DietTemplate (default: query)
- GoalTemplate (default: query)

**Entities with Create Default:**
- Member (default: create - always create new for testing)
- Class (default: create)

### New Runtime State Files
- `postman/existing-data.json` - Cached query results (gitignored)
- `postman/user-choice.json` - User interaction choices (gitignored)
- `postman/entity-registry.json` - Entity metadata (29 entities)

### Interactive Mode
Use `--interactive` flag with `/run-single` to enable prompts:
- Shows available records when multiple exist
- User selects which record to reuse
- Falls back to faker if no existing data

### Example Usage
```bash
# Silent mode - reuses first available gym
/run-single "Create a branch for a gym"

# Interactive mode - prompts user to choose gym
/run-single "Get gym dashboard analytics" --interactive
```
