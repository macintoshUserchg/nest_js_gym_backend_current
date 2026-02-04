<!-- Completions -->
<!-- name: /endpoints -->
<!-- description: List all available slash commands and API endpoints -->

List all available slash commands and API endpoints organized by category.

---

You are an endpoint lister.

## Step 1: Show Available Commands
```bash
ls -la .claude/commands/
```

Display the count and list of available commands.

## Step 2: Get Endpoint Count
```bash
echo "Total API Endpoints: $(cat postman/dep-graph.json | jq 'keys | length')"
```

## Step 3: List Endpoints by Category
Parse postman/dep-graph.json and display endpoints grouped by category.

Use these bash commands to organize endpoints:

```bash
# Auth & Users
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "user|login|logout|password" | sort

# Roles
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "role" | sort

# Gyms
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "gym" | sort

# Branches
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "branch" | sort

# Members
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "member" | sort

# Trainers
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "trainer" | sort

# Classes
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "class" | sort

# Membership Plans
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "membership.*plan" | sort

# Subscriptions
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "subscription" | sort

# Attendance
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "attendance" | sort

# Inquiries
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "inquir" | sort

# Invoices
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "invoice" | sort

# Payments
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "payment" | sort

# Analytics
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "analytics" | sort

# Audit Logs
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "audit" | sort

# Notifications
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "notification" | sort

# Body Progress
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "body.*progress|progress" | grep -v "goal" | sort

# Diet Plans
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "diet.*plan(?!.*template)|meal.*diet" | sort

# Diet Templates
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "diet.*template" | sort

# Diet Assignments
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "diet.*assignment" | sort

# Workout Logs
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "workout.*log" | sort

# Workout Templates
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "workout.*template" | sort

# Workout Plans
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "workout.*plan(?!.*template)" | sort

# Goals
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "^Create a new goal|^Get all goals|^Get a goal|^Update a goal|^Delete a goal|^Get goals for|^Complete a goal|^Update goal" | sort

# Goal Templates
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "goal.*template" | sort

# Goal Schedules
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "goal.*schedule" | sort

# Exercises
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "exercise" | sort

# Templates (Sharing & Assignments)
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "template.*(share|assignment)|assignment.*template" | sort

# Health & Info
cat postman/dep-graph.json | jq -r 'keys[]' | grep -iE "health|info.*api" | sort
```

## Display Format
Show results in this organized format:

```
╔══════════════════════════════════════════════════════════════════════╗
║                    Available Commands (5)                           ║
╚══════════════════════════════════════════════════════════════════════╝

/run-single <endpoint>  - Full subagent pipeline for one endpoint
/populate-all           - Run all endpoints in dependency order
/status                 - Check server status
/token                  - Get fresh JWT token
/endpoints              - Show this command list

Usage: /run-single "Get all gyms"

╔══════════════════════════════════════════════════════════════════════╗
║                    API Endpoints (228)                              ║
╚══════════════════════════════════════════════════════════════════════╝

AUTH & USERS (10)
─────────────────────────────────────────────────────────────────────
  User login                      Get current user profile
  User logout                     Update a user
  Create a new user               Delete a user
  Get all users                   Get a user by ID
  Change user password

[... continue for all categories ...]
```

## Tips
- Endpoint names in dep-graph.json are descriptive (e.g., "Get all gyms", not "Get Gyms")
- Use quotes around endpoint names with spaces: `/run-single "Get all gyms"`
- Public endpoints (no auth required): User login, User logout, Health check, API info, Create inquiry
- All other endpoints require Bearer token from User login
