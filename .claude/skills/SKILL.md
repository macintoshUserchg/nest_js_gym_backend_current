---
name: api-tester
description: Test REST APIs, generate fake test data, and validate responses. Use when testing endpoints, validating schemas, or generating test fixtures.
---

# API Tester

Test REST APIs, generate realistic fake data, and validate response structures.

## When to Use This Skill

- Testing CRUD endpoints (GET, POST, PUT, PATCH, DELETE)
- Validating response schemas and data types
- Generating test fixtures with realistic data
- Checking API authentication/authorization
- Verifying pagination, filtering, and sorting
- Stress testing endpoints with multiple requests

## Instructions

### Step 1: Test Basic Endpoint

```bash
# Send request and capture response
curl -s -w "\nHTTP_CODE:%{http_code}" -X METHOD "ENDPOINT" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}'
```

### Step 2: Generate Fake Data

Use these patterns for test fixtures:

**Member Data:**
```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "branchId": "550e8400-e29b-41d4-a716-446655440000",
  "membershipPlanId": 1
}
```

**Class Data:**
```json
{
  "name": "Morning Yoga",
  "category": "yoga",
  "trainerId": 1,
  "branchId": "550e8400-e29b-41d4-a716-446655440000",
  "maxCapacity": 20,
  "duration": 60,
  "daysOfWeek": [1, 3, 5],
  "timing": "morning"
}
```

**Inquiry Data:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "source": "website",
  "preferredContactMethod": "email",
  "branchId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Step 3: Validate Response

Check these conditions:

| Check | Expected Result |
|-------|-----------------|
| Status Code | 2xx for success, 4xx for client error, 5xx for server error |
| Required Fields | All documented fields present |
| Data Types | Strings, numbers, booleans match schema |
| Arrays | Length > 0 for list endpoints |
| Nested Objects | Structure matches expected format |
| Dates | ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) |

### Step 4: Report Results

Report findings in this format:

```
✓ GET /api/members - 200 OK
  - Returned 10 members
  - All required fields present
  - Pagination working correctly

✗ POST /api/members - 400 Bad Request
  - Missing required field: branchId
  - Error: "branchId should not be empty"
```

## Fake Data Generators

### UUID Generator
```bash
uuidgen | tr '[:upper:]' '[:lower:]'
# Example: 550e8400-e29b-41d4-a716-446655440000
```

### Email Generator
```bash
echo "test$(date +%s)@example.com"
# Example: test1736635200@example.com
```

### Phone Generator
```bash
echo "+1$(shuf -i 2000000000-9999999999 -n 1)"
# Example: +1234567890123
```

### Date Generator
```bash
date -v-1y +%Y-%m-%d  # 1 year ago
date -v+30d +%Y-%m-%d  # 30 days from now
```

### JSON Generator (jq)
```bash
jq -n \
  --arg name "Test User" \
  --arg email "test@example.com" \
  '{"name": $name, "email": $email}'
```

## Common Test Scenarios

### 1. Authentication Flow
```bash
# Login
TOKEN=$(curl -s -X POST "localhost:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}' | \
  jq -r '.access_token')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  "localhost:3001/members"
```

### 2. CRUD Operations
```bash
# Create
RESPONSE=$(curl -s -X POST "localhost:3001/members" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","branchId":"UUID","membershipPlanId":1}')
ID=$(echo $RESPONSE | jq -r '.id')

# Read
curl "localhost:3001/members/$ID"

# Update
curl -s -X PATCH "localhost:3001/members/$ID" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated"}'

# Delete
curl -s -X DELETE "localhost:3001/members/$ID"
```

### 3. Pagination Test
```bash
# Test pagination parameters
for page in 1 2 3; do
  curl "localhost:3001/members?page=$page&limit=10"
done
```

### 4. Filtering Test
```bash
# Test filter parameters
curl "localhost:3001/members?branchId=UUID&isActive=true&search=john"
```

## Response Validation Examples

### Valid JSON Response
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "branchId is required"],
  "error": "Bad Request"
}
```

## Test Report Template

```markdown
## API Test Report

### Endpoint: [METHOD] [URL]

**Date:** YYYY-MM-DD
**Tester:** Claude Code

### Request
```
[curl command]
```

### Response
```
[status code]
[response body]
```

### Validation Results
| Check | Status | Notes |
|-------|--------|-------|
| Status 200 | ✓ | Expected |
| Required fields | ✓ | All present |
| Data types | ✓ | Correct |
| Nested structure | ✗ | Missing 'subscription' |

### Issues Found
1. Missing subscription data in response
2. No default avatarUrl set

### Recommendations
Add default avatar generation in service layer
```

## Best Practices

1. **Always test authentication** - Verify protected endpoints reject invalid tokens
2. **Check edge cases** - Empty arrays, null values, boundary values
3. **Validate error responses** - Ensure proper error messages
4. **Test pagination** - Verify limit, offset, and total counts
5. **Use realistic data** - Fake data should match production patterns
6. **Clean up test data** - Delete created resources after testing
7. **Document findings** - Report both successes and failures

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token validity, ensure Bearer prefix |
| 400 Validation | Verify required fields and data types |
| 404 Not Found | Confirm resource ID exists |
| 500 Server Error | Check server logs, database connection |
| CORS error | Add proper headers or test via CLI |

## Quick Reference

```bash
# Test single endpoint
curl -X METHOD "URL" -H "Authorization: Bearer TOKEN"

# Test with data
curl -X POST "URL" -H "Content-Type: application/json" -d '{"key":"value"}'

# Verbose output (shows headers)
curl -v "URL"

# Show only headers
curl -I "URL"

# Follow redirects
curl -L "URL"
```
