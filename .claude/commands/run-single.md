<!-- Completions -->
<!-- name: /run-single -->
<!-- description: Run a single endpoint from Postman collection with full subagent pipeline -->

Runs a SINGLE endpoint from your Postman collection. Automatically resolves dependencies, silently runs support endpoints, generates faker body, hits your target, and writes request + response into the collection.

Usage: `/run-single <endpoint name>`

Example: `/run-single Create a new member`

---

You are the single-endpoint orchestrator. You coordinate the full pipeline to test one endpoint.

## Step 1: Get endpoint name
If the user passed an endpoint name as argument (after `/run-single`), use it.
If not, ask them which endpoint they want to run from postman/dep-graph.json.

## Step 2: Clean up runtime state
Run:
```bash
rm -f postman/captured-responses.json postman/current-body.json postman/current-response.json postman/current-response-clean.json postman/resolved-run-order.json
```

## Step 3: Resolve dependencies
Use the dependency-resolver subagent. First, read postman/dep-graph.json to understand the graph.

Then run:
```bash
node scripts/resolve-deps.js --target "<endpoint name>"
```

Read postman/resolved-run-order.json to see:
- supportEndpoints: endpoints to run silently before the target
- target: the endpoint the user wants to run

## Step 4: Run support endpoints silently
For EACH endpoint in supportEndpoints (in order):
1. Read the endpoint from postman/raw-collection.json to get method, URL, body schema
2. Generate faker body using node scripts/generate-body.js
3. Hit the endpoint with curl
4. Capture response to postman/captured-responses.json

For the User login endpoint, use static credentials from .claude/CLAUDE.md:
```json
{"email":"admin@fitnessfirstelite.com","password":"Admin123"}
```

If any support endpoint fails, STOP and report the error.

## Step 5: Generate target body
Use the faker-injector approach. Read .claude/CLAUDE.md for entity schemas and constraints.

Generate the body using node scripts/generate-body.js with:
- faker: patterns for fake data
- ref: patterns to pull IDs from captured-responses.json
- enum: patterns for ENUM values
- static: patterns for literal values

**IMPORTANT**: When writing JSON to current-body.json, use a file approach to avoid shell escaping issues with special characters:
```bash
# DON'T use echo or printf (shell will escape ! characters)
echo '{"password":"Admin123"}' > postman/current-body.json  # WRONG

# DO use a temp file approach to avoid shell escaping
cat > /tmp/body.json << 'EOF'
{"email":"admin@test.com","password":"Admin123"}
EOF
cp /tmp/body.json postman/current-body.json

# OR use heredoc directly
cat > postman/current-body.json << 'EOF'
{"email":"admin@test.com","password":"Admin123"}
EOF
```

Save the generated body to `postman/current-body.json`

## Step 6: Hit the target endpoint
Use curl to fire the HTTP request:
```bash
curl -s -w "\n__HTTP_STATUS__%{http_code}" -X <METHOD> http://localhost:3000<path> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d @postman/current-body.json > postman/current-response.json
```

Then extract the status code and clean response:
```bash
# Extract status code
HTTP_CODE=$(tail -n 1 postman/current-response.json | sed 's/__HTTP_STATUS__//')

# Extract clean JSON body (remove last line with status)
sed '$d' postman/current-response.json > postman/current-response-clean.json

# Display results
echo "Status: $HTTP_CODE"
cat postman/current-response-clean.json | jq '.'
```

## Step 7: Write to collection
If the endpoint succeeded (2xx status):
```bash
node scripts/update-collection.js --target "<endpoint name>"
```

This script will:
- Read the collection from postman/populated-collection.json (or postman/raw-collection.json)
- Find the endpoint by name (handles nested folders)
- Update the request body from postman/current-body.json
- Add/update the response example from postman/current-response-clean.json
- Save to postman/populated-collection.json

## Step 8: Update captured responses
Add the response to captured-responses.json for use by dependent endpoints:
```bash
# Initialize captured-responses.json if needed
if [ ! -f postman/captured-responses.json ]; then
  echo '{}' > postman/captured-responses.json
fi

# Add the endpoint response
cat > /tmp/update-captured.js << 'EOF'
const fs = require('fs');
const captured = JSON.parse(fs.readFileSync('postman/captured-responses.json', 'utf8'));
const response = JSON.parse(fs.readFileSync('postman/current-response-clean.json', 'utf8'));
captured['<endpoint name>'] = response;
fs.writeFileSync('postman/captured-responses.json', JSON.stringify(captured, null, 2));
EOF
node /tmp/update-captured.js
```

## When done
Say: "Done. <endpoint name> is now in populated-collection.json with request + response. Status: <status code>"
