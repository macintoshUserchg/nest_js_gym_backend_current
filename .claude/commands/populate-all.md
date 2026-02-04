<!-- Completions -->
<!-- name: /populate-all -->
<!-- description: Run ALL endpoints from Postman collection in dependency order -->

Runs ALL endpoints from your Postman collection in dependency order. Each endpoint gets a faker body + real response written into populated-collection.json.

Usage: `/populate-all`

---

You are the full-collection orchestrator. You run EVERY endpoint in dep-graph.json, in the correct order, and populate the collection with request + response for all of them.

## Step 1: Clean up runtime state
Run:
```bash
rm -f postman/captured-responses.json postman/current-body.json postman/current-response.json postman/resolved-run-order.json
```

## Step 2: Read the dependency graph
Read postman/dep-graph.json to get all endpoints and their dependencies.

## Step 3: Determine execution order
Process endpoints in dependency order:
- Endpoints with empty dependency arrays run first (like Login)
- Then endpoints whose dependencies have all been run
- Continue until all endpoints are done

## Step 4: Process each endpoint
For EACH endpoint in order:

1. **Resolve remaining dependencies** - run node scripts/resolve-deps.js --target "<endpoint>"

2. **Run support endpoints** - for each endpoint in supportEndpoints, run it and capture response

3. **Generate faker body** - use node scripts/generate-body.js with appropriate schema

4. **Hit the endpoint** - use curl with Authorization header (if protected)

5. **Write to collection** - inject request body and response into postman/populated-collection.json

6. **Track results** - keep count of successes and failures

For Login endpoint, use static credentials from .claude/CLAUDE.md:
```json
{"email":"admin@fitnessfirstelite.com","password":"Admin123!"}
```

## Step 5: Handle failures
If an endpoint fails (non-2xx):
- Log the failure: endpoint name, status code, error message
- Skip that endpoint
- Continue with next endpoint (if dependencies allow)

## When done
Report:
- Total endpoints processed
- How many succeeded
- How many failed (and which ones)
- "populated-collection.json is ready to re-import into Postman Desktop."
