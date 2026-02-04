# Commands & API Endpoints Reference

## Overview
A comprehensive reference for all available slash commands and API endpoints in the Gym Management System.

---

## Available Commands (5)

| Command | Description |
|---------|-------------|
| `/run-single <endpoint>` | Full subagent pipeline for one endpoint |
| `/populate-all` | Run all endpoints in dependency order |
| `/status` | Check server status |
| `/token` | Get fresh JWT token |
| `/endpoints` | Show this command list |

### Usage Examples
```bash
# Run a single endpoint
/run-single "Get all gyms"
/run-single "Create a new member"

# Run all endpoints
/populate-all

# Check server status
/status

# Get fresh JWT token
/token

# Show all endpoints
/endpoints
```

---

## API Endpoints (226)

### AUTH & USERS (10)
─────────────────────────────────────────────────────────────────────
```
User login                      Create a new user
User logout                     Get all users
Get current user profile        Get a user by ID
Update a user                   Delete a user
Change user password
```

### ROLES (6)
─────────────────────────────────────────────────────────────────────
```
Create a new role               Get role by ID
Get all roles                   Get role by name
Delete a role                   Update a role
```

### GYMS (11)
─────────────────────────────────────────────────────────────────────
```
Create a new gym                Get all branches for a gym
Delete a gym                    Get all members for a gym
Get all gyms                    Get all trainers for a gym
Get a gym by ID                 Get gym dashboard analytics
Update a gym                    Get gym member analytics
                                Get gym attendance analytics
                                Get 10 most recent payment transactions
```

### BRANCHES (18)
─────────────────────────────────────────────────────────────────────
```
Create a branch for a gym       Get all classes for a branch
Delete a branch                 Get all members for a branch
Get all branches                Get all trainers for a branch
Get a branch by ID              Get branch dashboard analytics
Update a branch                 Get branch member analytics
                                Get branch attendance analytics
                                Get 10 most recent payment transactions
                                Get inquiries for a branch
                                Get diet templates for a branch
                                Get workout templates for a branch
                                Get all membership plans for a branch
```

### MEMBERS (13)
─────────────────────────────────────────────────────────────────────
```
Create a new member             Get member dashboard data
Delete a member                 Get a member's subscription
Get all members                 Get member invoices
Get a member by ID              Get all trainer assignments for a member
Update a member                 Admin update a member
                                Get attendance records for a member
                                Get body progress records for a member
                                Get diet plans for a member
                                Get workout plans for a member
                                Get goals for a member
                                Get goal schedules for a member
                                Get diet assignments for a member
                                Get template assignments for a member
```

### TRAINERS (8)
─────────────────────────────────────────────────────────────────────
```
Create a new trainer            Get all members assigned to a trainer
Delete a trainer                Get trainer dashboard analytics
Get all trainers                Get attendance records for a trainer
Get a trainer by ID             Get workout logs for a trainer
Update a trainer                Get diet templates for a trainer
```

### CLASSES (6)
─────────────────────────────────────────────────────────────────────
```
Create a new class              Get class attendees
Delete a class                 Update a class
Get all classes
Get a class by ID
Get all classes for a branch
```

### MEMBERSHIP PLANS (5)
─────────────────────────────────────────────────────────────────────
```
Create a new membership plan    Get a membership plan by ID
Delete a membership plan        Update a membership plan
Get all membership plans
```

### SUBSCRIPTIONS (8)
─────────────────────────────────────────────────────────────────────
```
Create a new membership subscription  Get a subscription by ID
Delete a subscription           Get a member's subscription
Get all subscriptions           Update a subscription
                                Cancel a subscription
                                Get invoice for subscription
```

### ATTENDANCE (7)
─────────────────────────────────────────────────────────────────────
```
Mark attendance (check-in)      Get attendance records for a member
Check out                       Get attendance records for a trainer
Get all attendance records       Get attendance records for a branch
Get attendance record by ID
```

### INQUIRIES (7)
─────────────────────────────────────────────────────────────────────
```
Create a new inquiry (Public)   Update an inquiry
Delete an inquiry               Convert inquiry to member
Get all inquiries (Admin)       Get inquiry statistics
Get inquiry by ID
Get inquiries for a branch
```

### INVOICES (9)
─────────────────────────────────────────────────────────────────────
```
Create invoice                  Update invoice
Delete an invoice               Cancel invoice
Get all invoices                Get invoice payments
Get invoice by ID               Get member invoices
Get invoice for subscription
```

### PAYMENTS (6)
─────────────────────────────────────────────────────────────────────
```
Record payment                  Get invoice payments
Get all payments                Get member payments
Get a payment by ID
```

### ANALYTICS (7)
─────────────────────────────────────────────────────────────────────
```
Get gym dashboard analytics      Get branch dashboard analytics
Get gym member analytics        Get branch member analytics
Get gym attendance analytics     Get branch attendance analytics
Get trainer dashboard analytics
```

### AUDIT LOGS (6)
─────────────────────────────────────────────────────────────────────
```
Create an audit log entry       Get audit logs by action
Get all audit logs              Get audit logs by entity
Get audit log by ID             Get audit logs by user
```

### NOTIFICATIONS (5)
─────────────────────────────────────────────────────────────────────
```
Get all notifications for current user  Mark notification as read
Get notification by ID         Mark all notifications as read
Delete notification            Send notification
```

### BODY PROGRESS (6)
─────────────────────────────────────────────────────────────────────
```
Create a new body progress record  Get body progress record by ID
Delete a body progress record   Update a body progress record
Get all body progress records   Get body progress records for a member
```

### DIET PLANS & MEALS (14)
─────────────────────────────────────────────────────────────────────
```
Create a new diet plan          Add a meal to a diet plan
Delete a diet plan              Get meals for a diet plan
Get all diet plans              Get diet plans for a member
Get a diet plan by ID           Update a diet plan
Update a diet plan              Delete a meal from a diet plan
```

### DIET TEMPLATES (11)
─────────────────────────────────────────────────────────────────────
```
Create a diet template          Add a meal to a diet template
Delete a diet template          Get meals for a diet template
Get all diet templates          Get diet templates for a branch
Get a diet template by ID       Update a diet template
                                Delete a meal from a diet template
```

### DIET ASSIGNMENTS (7)
─────────────────────────────────────────────────────────────────────
```
Assign diet plan to a member     Get diet assignment progress
Cancel a diet assignment        Get diet assignments for a member
Get all diet assignments         Update a diet assignment
Get a diet assignment by ID
```

### WORKOUT LOGS (6)
─────────────────────────────────────────────────────────────────────
```
Create a new workout log         Get workout logs for a member
Delete a workout log            Get workout logs for a trainer
Get all workout logs            Update a workout log
Get a workout log by ID
```

### WORKOUT TEMPLATES (12)
─────────────────────────────────────────────────────────────────────
```
Create a workout template       Add an exercise to a workout template
Delete a workout template       Delete an exercise from a workout template
Get all workout templates       Update an exercise in a workout template
Get a workout template by ID     Get exercises for a workout template
Update a workout template       Get workout templates for a trainer
                                Get workout templates for a branch
```

### WORKOUT PLANS (9)
─────────────────────────────────────────────────────────────────────
```
Create a workout plan for a member  Add an exercise to a workout plan
Delete a workout plan           Delete an exercise from a workout plan
Get all workout plans           Update an exercise in a workout plan
Get a workout plan by ID         Get exercises for a workout plan
Update a workout plan           Get workout plans for a member
```

### GOALS (9)
─────────────────────────────────────────────────────────────────────
```
Create a new goal               Complete a goal
Delete a goal                   Get goals for a member
Get all goals                   Update goal progress
Get a goal by ID
Update a goal
```

### GOAL TEMPLATES (5)
─────────────────────────────────────────────────────────────────────
```
Create a goal template          Get goal templates for a trainer
Delete a goal template          Update a goal template
Get all goal templates
Get a goal template by ID
```

### GOAL SCHEDULES (9)
─────────────────────────────────────────────────────────────────────
```
Create a goal schedule for a member  Update a goal schedule milestone
Delete a goal schedule          Get goal schedule progress
Get all goal schedules          Get goal schedules for a member
Get a goal schedule by ID       Get goal schedule milestones
Update a goal schedule
```

### EXERCISES (12)
─────────────────────────────────────────────────────────────────────
```
Create a new exercise           Get exercises by body part
Delete an exercise              Get exercises by type
Get all exercises               Get exercises by difficulty
Get an exercise by ID
Update an exercise
```

### TEMPLATE SHARING & ASSIGNMENTS (7)
─────────────────────────────────────────────────────────────────────
```
Share a template                Get a template assignment by ID
Get all shared templates        Update a template assignment
Get a shared template by ID     Cancel a template assignment
Accept a shared template        Get template assignments for a member
Reject a shared template
Create a template assignment
```

### HEALTH & INFO (3)
─────────────────────────────────────────────────────────────────────
```
Health check endpoint
Get API information and available endpoints
```

---

## Tips

### Endpoint Naming
- Endpoint names are descriptive (e.g., "Get all gyms", not "Get Gyms")
- Use quotes around endpoint names with spaces: `/run-single "Get all gyms"`

### Authentication
- **Public endpoints** (no auth required):
  - User login
  - User logout
  - Health check
  - API info
- **All other endpoints** require Bearer token from User login

### Quick Reference

#### Common CRUD Pattern
```
Create a new <resource>          POST   /<resources>
Get all <resources>             GET    /<resources>
Get a <resource> by ID          GET    /<resources>/:id
Update a <resource>             PATCH  /<resources>/:id
Delete a <resource>             DELETE /<resources>/:id
```

#### Auth Credentials
| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@fitnessfirstelite.com` | `Admin123!` |
| TRAINER | `mike.johnson-smith0@email.com` | `Trainer123!` |
| MEMBER | `sophia.johnson-smith0@email.com` | `Member123!` |

---

## Files
- **Command**: `.claude/commands/endpoints.md`
- **Dependencies**: `postman/dep-graph.json`
- **Guide Created**: February 4, 2026
