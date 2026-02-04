# Postman Collection Populator - Single Endpoint Guide

This guide explains how to use the `/run-single` command to test individual endpoints and populate your Postman collection with realistic request bodies and live server responses.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Quick Start](#quick-start)
4. [Pipeline Flow](#pipeline-flow)
5. [Available Endpoints](#available-endpoints)
6. [Importing into Postman Desktop](#importing-into-postman-desktop)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Postman Collection Populator is a subagent pipeline that:

1. **Resolves dependencies** - Identifies which endpoints must run before your target
2. **Runs support endpoints** - Silently executes dependent endpoints
3. **Generates fake data** - Creates realistic request bodies using Faker.js
4. **Hits your server** - Makes actual HTTP requests to your running NestJS app
5. **Captures responses** - Saves real server responses
6. **Updates collection** - Writes request + response to `populated-collection.json`

---

## File Structure

```
postman/
├── raw-collection.json              # Original collection (source, read-only)
│   └── 4.4 MB - Endpoints + schema only
│
├── populated-collection.json        # Output collection (import this one!)
│   └── 4.2 MB - Request bodies + live responses
│
├── dep-graph.json                   # Dependency graph (226 endpoints)
│   └── Maps which endpoints depend on others
│
└── Runtime state files (auto-managed):
    ├── captured-responses.json      # Responses from support endpoints
    ├── current-body.json            # Generated request body
    ├── current-response.json        # Raw response + status code
    ├── current-response-clean.json  # Clean JSON response
    └── resolved-run-order.json      # Execution order for target

scripts/
├── resolve-deps.js                  # Resolves endpoint dependencies
├── generate-body.js                 # Generates faker request bodies
└── update-collection.js             # Updates collection with body + response
```

### Which Collection to Import?

| File | Purpose | Import? |
|------|---------|---------|
| `raw-collection.json` | Source template | ❌ No |
| `populated-collection.json` | **Ready to use** | ✅ **YES** |

---

## Quick Start

### Prerequisites

1. **Server running**: Make sure your NestJS server is running on port 3000
   ```bash
   npm run start:dev
   ```

2. **Check server status**:
   ```bash
   /status
   ```

### Basic Usage

```bash
/run-single <endpoint name>
```

### Examples

```bash
# Simple GET endpoint
/run-single Get all gyms

# Create a new resource
/run-single Create a new gym

# Endpoint with dependencies
/run-single Create a new member
# (Will automatically run: User login → Create Branch → Create Member)

# Complex nested endpoint
/run-single Assign diet plan to a member (trainer/admin only)
```

---

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         /run-single Pipeline                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER INPUT: /run-single "Create a new member"                              │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 1: Clean Runtime State                                         │    │
│  │                                                                     │    │
│  │   rm -f postman/captured-responses.json \                           │    │
│  │        postman/current-body.json \                                  │    │
│  │        postman/current-response.json \                              │    │
│  │        postman/current-response-clean.json \                        │    │
│  │        postman/resolved-run-order.json                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 2: Resolve Dependencies                                        │    │
│  │                                                                     │    │
│  │   node scripts/resolve-deps.js --target "Create a new member"       │    │
│  │                                                                     │    │
│  │   Output: postman/resolved-run-order.json                           │    │
│  │   {                                                                │    │
│  │     "supportEndpoints": [                                          │    │
│  │       "User login",                                                │    │
│  │       "Create a branch for a gym",                                 │    │
│  │       "Create a new gym"                                            │    │
│  │     ],                                                              │    │
│  │     "target": "Create a new member"                                 │    │
│  │   }                                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 3: Run Support Endpoints (Silent)                              │    │
│  │                                                                     │    │
│  │   For EACH endpoint in supportEndpoints:                            │    │
│  │   1. Read endpoint from raw-collection.json                         │    │
│  │   2. Generate faker body via generate-body.js                       │    │
│  │   3. Hit endpoint with curl                                         │    │
│  │   4. Capture response to captured-responses.json                    │    │
│  │                                                                     │    │
│  │   Special case: User login uses static credentials:                 │    │
│  │   {"email":"admin@fitnessfirstelite.com","password":"Admin123!"}   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 4: Generate Target Request Body                                │    │
│  │                                                                     │    │
│  │   node scripts/generate-body.js                                     │    │
│  │                                                                     │    │
│  │   Features:                                                        │    │
│  │   - faker: Generate fake data (names, emails, etc.)                │    │
│  │   - ref: Pull IDs from captured-responses.json                     │    │
│  │   - enum: Use valid ENUM values                                    │    │
│  │   - static: Use literal values                                      │    │
│  │                                                                     │    │
│  │   Output: postman/current-body.json                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 5: Hit Target Endpoint                                         │    │
│  │                                                                     │    │
│  │   curl -s -w "\n__HTTP_STATUS__%{http_code}" \                      │    │
│  │     -X POST http://localhost:3000/members \                         │    │
│  │     -H "Content-Type: application/json" \                           │    │
│  │     -H "Authorization: Bearer <token>" \                            │    │
│  │     -d @postman/current-body.json \                                 │    │
│  │     > postman/current-response.json                                 │    │
│  │                                                                     │    │
│  │   Extract status code and clean body:                               │    │
│  │   - HTTP_CODE → extracted from last line                            │    │
│  │   - Clean JSON → saved to current-response-clean.json               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 6: Update Collection                                           │    │
│  │                                                                     │    │
│  │   node scripts/update-collection.js --target "Create a new member"  │    │
│  │                                                                     │    │
│  │   What it does:                                                    │    │
│  │   1. Read from populated-collection.json (or raw-collection.json)   │    │
│  │   2. Find endpoint by name (handles nested folders)                 │    │
│  │   3. Update request.body.raw with current-body.json                 │    │
│  │   4. Add/update response[0] with current-response-clean.json        │    │
│  │   5. Write to populated-collection.json                             │    │
│  │                                                                     │    │
│  │   Output: ✓ Updated endpoint: Create a new member                   │    │
│  │           ✓ Collection saved to: postman/populated-collection.json   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ STEP 7: Update Captured Responses                                   │    │
│  │                                                                     │    │
│  │   Save response to captured-responses.json                           │    │
│  │   (Available for dependent endpoints)                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           ↓                                                                 │
│  RESULT: "Create a new member" now in populated-collection.json            │
│          with request body + live response                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Available Endpoints

Your collection contains **226 endpoints** organized into folders:

### View All Endpoints

```bash
# List all endpoints (226 total)
cat postman/dep-graph.json | jq -r 'keys[]'

# Count endpoints
cat postman/dep-graph.json | jq -r 'keys[]' | wc -l

# Search for specific endpoints
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "member"
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "gym"
```

### Popular Endpoints

| Category | Endpoints |
|----------|-----------|
| **Auth** | `User login`, `User logout` |
| **Gyms** | `Create a new gym`, `Get all gyms`, `Get a gym by ID` |
| **Branches** | `Create a branch for a gym`, `Get all branches` |
| **Members** | `Create a new member`, `Get all members`, `Get member dashboard` |
| **Trainers** | `Create a new trainer`, `Get all trainers` |
| **Classes** | `Create a new class`, `Get all classes` |
| **Subscriptions** | `Create a new membership subscription`, `Cancel a subscription` |
| **Workouts** | `Create a workout template`, `Get all workout templates` |
| **Diet** | `Create a diet template`, `Assign diet plan to a member` |
| **Analytics** | `Get gym dashboard analytics`, `Get branch attendance analytics` |

### Full Endpoint List (First 50)

```
Accept a shared template
Add a meal to a diet plan
Add a meal to a diet template
Add an exercise to a workout plan
Add an exercise to a workout template
Admin update a member
Assign a member to a trainer
Assign diet plan to a member (trainer/admin only)
Assign workout template to a member
Cancel a diet assignment
Cancel a subscription
Cancel a template assignment
Cancel invoice
Change user password
Check out
Complete a goal
Convert inquiry to member
Create a branch for a gym
Create a diet template (trainer/admin only)
Create a goal schedule for a member
Create a goal template
Create a new body progress record
Create a new class
Create a new diet plan
Create a new exercise
Create a new goal
Create a new gym
Create a new inquiry (Public)
Create a new member
Create a new membership plan
Create a new membership subscription
Create a new progress tracking record
Create a new role
Create a new trainer
Create a new user
Create a new workout log
Create a workout template (trainer/admin only)
Delete a body progress record
Delete a class
Delete a diet plan
Delete a diet template
Delete a goal
Delete a goal schedule
Delete a goal template
Delete a gym
... and 176 more
```

---

## Importing into Postman Desktop

### Method 1: Direct Import

```bash
# Open file in Postman Desktop
open postman/populated-collection.json
```

Then in Postman Desktop:
1. Click **Import** (or drag & drop the file)
2. Select `populated-collection.json`
3. Click **Import**

### Method 2: Copy to Postman App

1. Open Postman Desktop
2. Click **Import** → **Upload Files**
3. Navigate to: `postman/populated-collection.json`
4. Click **Open**

### What You'll Get

After importing, you'll have:
- **226 endpoints** organized in 32 folders
- **Request examples** with realistic fake data
- **Response examples** from your live server
- **Proper authentication** (Bearer token from login)

### Collection Structure

```
Gym Management System API
├── auth
│   ├── User login (with credentials + token response)
│   └── User logout
├── gyms
│   ├── Create a new gym (with faker body + response)
│   ├── Get all gyms
│   ├── Get a gym by ID
│   └── ...
├── members
│   ├── Create a new member
│   ├── Get all members
│   └── ...
├── branches
├── trainers
├── classes
├── subscriptions
├── workouts
├── diet-plans
├── analytics
└── ... (32 folders total)
```

---

## Troubleshooting

### Server Not Running

**Problem**: Connection refused errors
```bash
curl: (7) Failed to connect to localhost port 3000
```

**Solution**: Start your server
```bash
npm run start:dev
```

**Verify**: Check server status
```bash
/status
# or
curl http://localhost:3000/health
```

### Authentication Issues

**Problem**: 401 Unauthorized errors

**Solution**: Check that `User login` endpoint works first
```bash
/run-single User login
```

Expected response:
```json
{
  "userid": "...",
  "access_token": "..."
}
```

### Endpoint Not Found

**Problem**: `Error: Endpoint "X" not found in collection`

**Solution**: Use exact endpoint name from dep-graph.json
```bash
# Find exact name
cat postman/dep-graph.json | jq -r 'keys[]' | grep -i "member"

# Use exact name
/run-single Create a new member
```

### Generated Body Issues

**Problem**: Invalid request body causing 400 errors

**Solution**: Check the generated body
```bash
cat postman/current-body.json | jq '.'
```

### Dependencies Failing

**Problem**: Support endpoint fails, causing target to fail

**Solution**: Run support endpoints individually
```bash
# Example: If "Create a new member" fails
/run-single User login
/run-single Create a new gym
/run-single Create a branch for a gym
/run-single Create a new member
```

### Collection Not Updating

**Problem**: Response not showing in Postman Desktop

**Solution**:
1. Re-import the collection (it updates in-place)
2. Or check the file directly:
```bash
cat postman/populated-collection.json | jq '.. | objects | select(.name == "Your Endpoint")'
```

### Cleanup and Restart

If things get messy, clean up and start fresh:
```bash
# Remove runtime state
rm -f postman/captured-responses.json \
       postman/current-body.json \
       postman/current-response.json \
       postman/current-response-clean.json \
       postman/resolved-run-order.json

# Start fresh with raw collection
rm postman/populated-collection.json

# Now run endpoints again
/run-single User login
```

---

## Tips and Best Practices

1. **Start simple**: Begin with `User login`, then `Get all gyms`
2. **Use exact names**: Copy endpoint names from `dep-graph.json`
3. **Check dependencies**: Complex endpoints may require multiple support endpoints
4. **Re-import collection**: After running endpoints, re-import to see updates
5. **Run in order**: Run create operations before read operations for new resources
6. **Monitor server**: Keep an eye on your server console for errors
7. **Use public endpoints first**: `/health`, `/info` don't require auth

---

## Quick Reference

### Available Commands

| Command | Description |
|---------|-------------|
| `/run-single <name>` | Run single endpoint with full pipeline |
| `/populate-all` | Run all 226 endpoints in dependency order |
| `/status` | Check if server is running |
| `/endpoints` | Show all available commands |
| `/token` | Get fresh JWT token |

### For API Testing

For comprehensive API testing and validation, use the **api-tester** skill:
- Testing CRUD endpoints
- Validating response schemas
- Generating test fixtures
- Checking authentication/authorization

---

## Related Documentation

- **Main Project Docs**: See `CLAUDE.md` for complete architecture
- **Postman Populator Config**: See `.claude/CLAUDE.md` for auth credentials and entity schemas
- **Source Scripts**: See `scripts/` directory for implementation details

---

**Last Updated**: February 4, 2026
**Version**: 1.1.0

## Changelog

- **v1.1.0 (Feb 4, 2026)**: Removed redundant quick test commands, simplified to 5 commands (3 info + 2 pipeline), added api-tester skill reference
- **v1.0.0 (Feb 4, 2026)**: Initial release with complete pipeline guide
