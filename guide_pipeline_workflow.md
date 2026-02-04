# /run-single Pipeline Documentation

## Overview

The `/run-single` pipeline is a sophisticated Postman collection populator that automates API testing by:

1. **Resolving dependencies** - Automatically runs prerequisite endpoints
2. **Generating fake data** - Uses Faker.js to create realistic request bodies
3. **Hitting live endpoints** - Makes real HTTP requests to your NestJS server
4. **Capturing responses** - Stores real API responses
5. **Updating Postman collections** - Writes request+response examples back to your collection

**Why it exists**: To quickly populate a Postman collection with realistic request bodies and actual API responses, eliminating manual copy-pasting.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           /run-single Pipeline                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Input                                                                   │
│  │                                                                            │
│  ▼                                                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  1. dependency-resolver                                                │   │
│  │     Input: endpoint name, dep-graph.json                               │   │
│  │     Output: resolved-run-order.json                                   │   │
│  └───────────────────────────┬────────────────────────────────────────┘   │
│                              │                                             │
│  ▼                              ▼                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  2. silent-runner (for each support endpoint)                        │   │
│  │     Input: endpoint from raw-collection.json                          │   │
│  │     Output: captured-responses.json                                  │   │
│  └───────────────────────────┬────────────────────────────────────────┘   │
│                              │                                             │
│  ┌───────────────────────────▼────────────────────────────────────────┐   │
│  │  3. faker-injector                                                     │   │
│  │     Input: raw-collection.json, CLAUDE.md (schemas)                  │   │
│  │     Output: current-body.json                                          │   │
│  └───────────────────────────┬────────────────────────────────────────┘   │
│                              │                                             │
│  ┌───────────────────────────▼────────────────────────────────────────┐   │
│  │  4. endpoint-runner                                                   │   │
│  │     Input: current-body.json, bearer token                             │   │
│  │     Output: current-response.json, current-response-clean.json     │   │
│  └───────────────────────────┬────────────────────────────────────────┘   │
│                              │                                             │
│  ┌───────────────────────────▼────────────────────────────────────────┐   │
│  │  5. collection-writer                                                  │   │
│  │     Input: current-body.json, current-response-clean.json           │   │
│  │     Output: populated-collection.json                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│  ▼                              ▼                                             │
│  Success Message + captured-responses.json updated                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 5 Subagents

### 1. dependency-resolver
**Purpose**: Topological sort of endpoint dependencies

**Input**:
- Endpoint name (from user)
- `postman/dep-graph.json` - Dependency graph

**Execution**:
```bash
node scripts/resolve-deps.js --target "Get all gyms"
```

**Output**:
- `postman/resolved-run-order.json`:
  ```json
  {
    "supportEndpoints": ["User login"],
    "target": "Get all gyms"
  }
  ```

**When it runs**: Step 3 of the pipeline

---

### 2. silent-runner
**Purpose**: Run support endpoints silently, capture IDs/tokens for dependent endpoints

**Input**:
- Endpoints from `postman/raw-collection.json`
- Static credentials for login

**Execution**:
```bash
# For User login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitnessfirstelite.com","password":"Admin123"}'
```

**Output**:
- Updates `postman/captured-responses.json` with responses

**When it runs**: Step 4 of the pipeline (iterates through all support endpoints)

**Key Features**:
- Runs endpoints in dependency order
- Captures tokens for authentication
- Captures IDs for referencing in request bodies
- Fails fast if any support endpoint fails

---

### 3. faker-injector
**Purpose**: Generate fake request bodies using Faker.js

**Input**:
- `postman/raw-collection.json` - Request body schema
- `.claude/CLAUDE.md` - Entity schemas and constraints
- `postman/captured-responses.json` - For ID references

**Execution**:
```bash
node scripts/generate-body.js
```

**Output**:
- `postman/current-body.json` - Generated request body

**Patterns Supported**:
```json
{
  "email": "faker:internet.email",
  "fullName": "faker:person.fullName",
  "gymId": "ref:Get all gyms.gymId",  // Pull from captured response
  "role": "enum:ADMIN",                 // Use enum value
  "active": "static:true"               // Literal value
}
```

**When it runs**: Step 5 of the pipeline

---

### 4. endpoint-runner
**Purpose**: Hit the target endpoint with curl, capture response

**Input**:
- `postman/current-body.json` - Request body
- Bearer token (from captured-responses.json)

**Execution**:
```bash
curl -s -w "\n__HTTP_STATUS__%{http_code}" -X GET http://localhost:3000/gyms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d @postman/current-body.json > postman/current-response.json

# Extract status code
HTTP_CODE=$(tail -n 1 postman/current-response.json | sed 's/__HTTP_STATUS__//')

# Extract clean JSON
sed '$d' postman/current-response.json > postman/current-response-clean.json
```

**Output**:
- `postman/current-response.json` - Raw response + status
- `postman/current-response-clean.json` - Clean JSON response

**When it runs**: Step 6 of the pipeline

---

### 5. collection-writer
**Purpose**: Write request body + response example to Postman collection

**Input**:
- `postman/current-body.json` - Request body
- `postman/current-response-clean.json` - Response example
- Endpoint name

**Execution**:
```bash
node scripts/update-collection.js --target "Get all gyms"
```

**Output**:
- Updates `postman/populated-collection.json`:
  - Finds endpoint by name (handles nested folders)
  - Updates request body
  - Adds response example
  - Saves collection

**When it runs**: Step 7 of the pipeline

---

## The 8-Step Workflow

### Step 1: Get Endpoint Name
User provides endpoint name as argument:
```bash
/run-single "Get all gyms"
```

Or prompts user to select from `postman/dep-graph.json`.

---

### Step 2: Clean Up Runtime State
```bash
rm -f postman/captured-responses.json \
      postman/current-body.json \
      postman/current-response.json \
      postman/current-response-clean.json \
      postman/resolved-run-order.json
```

---

### Step 3: Resolve Dependencies
```bash
node scripts/resolve-deps.js --target "Get all gyms"
```

Output: `postman/resolved-run-order.json`
```json
{
  "supportEndpoints": ["User login"],
  "target": "Get all gyms"
}
```

---

### Step 4: Run Support Endpoints Silently
For each endpoint in `supportEndpoints`:
1. Read endpoint details from `postman/raw-collection.json`
2. Generate request body (if needed)
3. Execute curl request
4. Capture response to `postman/captured-responses.json`

Special handling for **User login**:
```json
{"email":"admin@fitnessfirstelite.com","password":"Admin123"}
```

---

### Step 5: Generate Target Request Body
Use `node scripts/generate-body.js` with patterns:
- `faker:` - Fake data
- `ref:` - Pull IDs from captured-responses.json
- `enum:` - ENUM values
- `static:` - Literal values

Save to `postman/current-body.json`

---

### Step 6: Hit Target Endpoint
```bash
curl -s -w "\n__HTTP_STATUS__%{http_code}" -X GET http://localhost:3000/gyms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d @postman/current-body.json > postman/current-response.json
```

Extract status and clean response.

---

### Step 7: Write to Collection
```bash
node scripts/update-collection.js --target "Get all gyms"
```

Updates `postman/populated-collection.json` with request body and response example.

---

### Step 8: Update Captured Responses
```bash
# Initialize if needed
if [ ! -f postman/captured-responses.json ]; then
  echo '{}' > postman/captured-responses.json
fi

# Add endpoint response
node -e "
const fs = require('fs');
const captured = JSON.parse(fs.readFileSync('postman/captured-responses.json', 'utf8'));
const response = JSON.parse(fs.readFileSync('postman/current-response-clean.json', 'utf8'));
captured['Get all gyms'] = response;
fs.writeFileSync('postman/captured-responses.json', JSON.stringify(captured, null, 2));
"
```

---

## Runtime State Files

| File | Purpose | Lifetime |
|------|---------|----------|
| `postman/captured-responses.json` | Stores responses from support endpoints for ID/token injection | Per pipeline run |
| `postman/current-body.json` | Current request body for target endpoint | Per endpoint |
| `postman/current-response.json` | Raw HTTP response + status code | Per endpoint |
| `postman/current-response-clean.json` | Clean JSON response body | Per endpoint |
| `postman/resolved-run-order.json` | Dependency resolution result | Per pipeline run |

---

## Dependency Graph

Located at `postman/dep-graph.json` with **226 endpoints**.

### Format
```json
{
  "Endpoint Name": ["dependency1", "dependency2"],
  "Public Endpoint": [],
  "Endpoint with Deps": ["User login", "Create a gym"]
}
```

### Examples
```json
{
  "User login": [],
  "Get all gyms": ["User login"],
  "Get a gym by ID": ["Create a new gym"],
  "Create a new member": ["User login", "Create a branch for a gym"],
  "Delete a gym": ["Create a new gym"]
}
```

### Public Endpoints (No Auth)
- User login
- User logout
- Health check endpoint
- Get API information
- Create a new inquiry (Public)

---

## Authentication Flow

### Public Endpoints
No authentication required. Can be called directly.

### Protected Endpoints
Require `Authorization: Bearer <token>` header.

### Login Process
```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitnessfirstelite.com","password":"Admin123"}'

# Response:
{
  "userid": "usr-123",
  "access_token": "eyJhbGc..."
}

# 2. Use token in subsequent requests
curl -X GET http://localhost:3000/gyms \
  -H "Authorization: Bearer eyJhbGc..."
```

### Static Credentials (for Pipeline)
| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@fitnessfirstelite.com` | `Admin123` |

**Note**: Documentation uses `Admin123` (no `!`) to avoid bash permission issues. Actual API requires `Admin123!`.

---

## Request Body Generation (Faker.js)

### Available Patterns

#### faker: - Fake Data
```json
{
  "email": "faker:internet.email",
  "fullName": "faker:person.fullName",
  "phone": "faker:phone.number",
  "dateOfBirth": "faker:date.past",
  "address": "faker:location.streetAddress"
}
```

#### ref: - Pull IDs from Captured Responses
```json
{
  "gymId": "ref:Get all gyms[0].gymId",
  "branchId": "ref:Get all gyms[0].branches[0].branchId"
}
```

#### enum: - ENUM Values
```json
{
  "role": "enum:ADMIN",
  "gender": "enum:male",
  "status": "enum:active"
}
```

#### static: - Literal Values
```json
{
  "isActive": "static:true",
  "count": "static:10"
}
```

### Complex Example
```json
{
  "fullName": "faker:person.fullName",
  "email": "faker:internet.email",
  "phone": "faker:phone.number",
  "gymId": "ref:Get all gyms[0].gymId",
  "branchId": "ref:Get all branches[0].branchId",
  "role": "enum:TRAINER",
  "specialization": "faker:word.noun",
  "isActive": "static:true"
}
```

---

## Example Flow: Get All Gyms

### Input
```bash
/run-single "Get all gyms"
```

### Execution Trace

**Step 1: Get endpoint name**
- Target: "Get all gyms"

**Step 2: Clean runtime state**
```bash
rm -f postman/*.json
```

**Step 3: Resolve dependencies**
```bash
node scripts/resolve-deps.js --target "Get all gyms"
```
Output:
```json
{
  "supportEndpoints": ["User login"],
  "target": "Get all gyms"
}
```

**Step 4: Run support endpoints**
- Run "User login" silently
- Capture response:
  ```json
    {
      "userid": "usr-123",
      "access_token": "eyJhbGc..."
    }
    ```
- Save to `captured-responses.json`

**Step 5: Generate target body**
- GET request has no body
- Create `current-body.json`: `{}`

**Step 6: Hit target endpoint**
```bash
curl -X GET http://localhost:3000/gyms \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```
Response:
```json
[
  {
    "gymId": "6a0192f3-8b20-47e6-ba0d-1de5057a15b1",
    "name": "Fitness First Elite",
    "branches": [...]
  }
]
```

**Step 7: Write to collection**
```bash
node scripts/update-collection.js --target "Get all gyms"
```
Updates `populated-collection.json`

**Step 8: Update captured responses**
Add response to `captured-responses.json`

### Output
```
Done. Get all gyms is now in populated-collection.json with request + response. Status: 200
```

---

## Example Flow: Create a New Member (Complex)

### Input
```bash
/run-single "Create a new member"
```

### Execution Trace

**Step 3: Resolve dependencies**
```json
{
  "supportEndpoints": ["User login", "Create a branch for a gym"],
  "target": "Create a new member"
}
```

**Step 4: Run support endpoints**
1. **User login** → Capture token
2. **Create a branch for a gym** → Captures branch ID

**Step 5: Generate target body**
```json
{
  "fullName": "faker:person.fullName",
  "email": "faker:internet.email",
  "phone": "faker:phone.number",
  "branchId": "ref:Create a branch for a gym.branchId",
  "isActive": "static:true"
}
```

**Step 6: Hit target endpoint**
```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @postman/current-body.json
```

---

## Troubleshooting

### 401 Unauthorized
**Cause**: Token expired

**Solution**:
```bash
# Get fresh token
cat > /tmp/login.json << 'EOF'
{"email":"admin@fitnessfirstelite.com","password":"Admin123!"}
EOF
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d @/tmp/login.json | jq -r '.access_token')
```

### Bash Permission Errors
**Cause**: Special characters (`!`) in passwords

**Solution**: Use heredoc approach:
```bash
cat > /tmp/login.json << 'EOF'
{"email":"admin@fitnessfirstelite.com","password":"Admin123!"}
EOF
```

### Endpoint Not Found
**Cause**: Incorrect endpoint name

**Solution**: Check exact name in `dep-graph.json`:
```bash
cat postman/dep-graph.json | jq 'keys'
```

### Missing IDs
**Cause**: Dependency endpoint failed to run

**Solution**: Check support endpoint executed successfully. Look at `captured-responses.json` for missing data.

### Empty Response
**Cause**: GET request on empty resource

**Solution**: This is expected behavior. Check database for data.

---

## Quick Reference

### Command Syntax
```bash
/run-single "<endpoint name>"
```

### Common Flags
- `--target <name>` - Used by scripts, not the command itself

### File Locations

**Commands**:
- `.claude/commands/run-single.md` - Main orchestrator
- `.claude/commands/endpoints.md` - List all endpoints
- `.claude/commands/status.md` - Check server status
- `.laude/commands/token.md` - Get fresh token
- `.claude/commands/populate-all.md` - Run all endpoints

**Scripts**:
- `scripts/resolve-deps.js` - Dependency resolution
- `scripts/generate-body.js` - Faker.js body generation
- `scripts/update-collection.js` - Collection updater

**Data**:
- `postman/dep-graph.json` - Dependency graph
- `postman/raw-collection.json` - Source collection
- `postman/populated-collection.json` - Output collection
- `postman/captured-responses.json` - Runtime state

**Subagents**:
- `.claude/agents/dependency-resolver.md`
- `.claude/agents/silent-runner.md`
- `.claude/agents/faker-injector.md`
- `.claude/agents/endpoint-runner.md`
- `.claude/agents/collection-writer.md`

### Auth Credentials
```json
{
  "email": "admin@fitnessfirstelite.com",
  "password": "Admin123!"
}
```

### Server URL
```
http://localhost:3000
```

---

## Related Documentation

- **User Guide**: `guide_run-single.md` - How to use the command
- **Commands Reference**: `guide_commands_pipeline.md` - All commands and endpoints
- **Config**: `.claude/CLAUDE.md` - Entity schemas, faker patterns
- **Setup**: `.serena/memories/postman-collection-populator-setup.md` - Setup and history

---

## Summary

The `/run-single` pipeline is a powerful automation tool that:
1. Orchestrates **5 subagents** to handle different concerns
2. Executes **8 steps** to test a single endpoint
3. Manages **5 runtime files** for state tracking
4. Handles **226 API endpoints** with dependency resolution
5. Generates **realistic fake data** using Faker.js
6. Produces **import-ready Postman collections**

The pipeline enables rapid API testing and documentation by automating the tedious manual process of populating Postman collections with request examples and real responses.
