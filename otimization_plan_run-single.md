# `/run-single` Pipeline Optimization Plan

## Overview
This document outlines the optimization strategy for the `/run-single` Postman collection populator pipeline to reduce execution time by 40-50%.

## Performance Baseline
- **Current**: Typical endpoint run takes 6-10 seconds
- **Target**: Reduce to 3-5 seconds (40-50% faster)

## Root Causes Identified

### 1. Redundant Collection Parsing
- Collection is parsed 7+ times per run
- Each subagent reads the collection independently
- ~50-200KB JSON parsed repeatedly

### 2. Auth Token Cache Overhead
- Spawning Node processes for cache check
- 200-500ms overhead per run

### 3. Sequential Endpoint Execution
- Support endpoints run one-by-one
- Many are independent and could run in parallel

### 4. Repeated File I/O
- Multiple redundant reads of same config files
- Response writes after every endpoint

## Optimization Strategy

### Phase 1: Collection Cache Module (HIGH PRIORITY)

**Impact**: 30-40% faster overall
**Effort**: ~30 minutes

Create `scripts/collection-cache.js`:
```javascript
let cachedCollection = null;
let cacheTime = null;

function getCollection(forceRefresh = false) {
  const now = Date.now();
  if (!cachedCollection || forceRefresh || (cacheTime && now - cacheTime > 60000)) {
    const collectionPath = 'postman/populated-collection.json';
    const fallbackPath = 'postman/raw-collection.json';
    const path = fs.existsSync(collectionPath) ? collectionPath : fallbackPath;
    cachedCollection = JSON.parse(fs.readFileSync(path, 'utf8'));
    cacheTime = now;
  }
  return cachedCollection;
}

module.exports = { getCollection };
```

**Files to update**:
- `.claude/agents/silent-runner.md`
- `.claude/agents/faker-injector.md`
- `.claude/agents/endpoint-runner.md`
- `.claude/agents/collection-writer.md`
- `scripts/data-reuse-service.js`
- `scripts/generate-body.js`

---

### Phase 2: Inline Auth Cache Check (HIGH PRIORITY)

**Impact**: Saves 200-500ms per run
**Effort**: ~20 minutes

Replace Node process spawns in `.claude/commands/run-single.md` with inline Bash:

```bash
# Inline auth cache check (no process spawn)
if [ -f postman/auth-cache.json ]; then
  expires_at=$(jq -r '.expires_at // empty' postman/auth-cache.json 2>/dev/null)
  if [ -n "$expires_at" ]; then
    current_epoch=$(date +%s)
    expire_epoch=$(date -d "$expires_at" +%s 2>/dev/null || echo 0)

    if [ $current_epoch -lt $expire_epoch ]; then
      echo "✓ Using cached auth token (expires: $expires_at)"
      cached_token=$(jq -r '.token' postman/auth-cache.json)
      cached_userid=$(jq -r '.userid // empty' postman/auth-cache.json)
      cached_role=$(jq -r '.role // "ADMIN"' postman/auth-cache.json)

      jq -n \
        --arg token "$cached_token" \
        --arg userid "$cached_userid" \
        --arg role "$cached_role" \
        '{"User login": {userid: $userid, access_token: $token, role: $role}}' \
        > postman/captured-responses.json

      AUTH_VALID="true"
    else
      AUTH_VALID="false"
    fi
  else
    AUTH_VALID="false"
  fi
else
  AUTH_VALID="false"
fi

# Only login if cache invalid
if [ "$AUTH_VALID" != "true" ]; then
  # Run login flow...
  node scripts/update-auth-cache.js
fi
```

---

### Phase 3: Entity Registry Lookup Map (MEDIUM PRIORITY)

**Impact**: 5-10% faster body generation
**Effort**: ~15 minutes

Update `scripts/generate-body.js` - add after line 86:

```javascript
// Build O(1) lookup map for collection endpoint → entity
const collectionEndpointToEntity = {};
for (const [name, config] of Object.entries(entityRegistry.entities)) {
  if (config.collectionEndpoint) {
    collectionEndpointToEntity[config.collectionEndpoint] = { name, ...config };
  }
}

// Replace O(n) lookup with O(1)
function getEntityByCollectionEndpoint(endpointName) {
  return collectionEndpointToEntity[endpointName] || null;
}
```

---

### Phase 4: Response Buffering (MEDIUM PRIORITY)

**Impact**: 20-30% faster for multi-endpoint runs
**Effort**: ~45 minutes

Create `scripts/response-buffer.js`:
```javascript
const fs = require('fs');

let capturedResponses = {};
let filePath = 'postman/captured-responses.json';

function init() {
  if (fs.existsSync(filePath)) {
    try {
      capturedResponses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      capturedResponses = {};
    }
  }
}

function setResponse(endpointName, responseData) {
  capturedResponses[endpointName] = responseData;
}

function getResponse(endpointName) {
  return capturedResponses[endpointName];
}

function hasResponse(endpointName) {
  return endpointName in capturedResponses;
}

function flush() {
  fs.writeFileSync(filePath, JSON.stringify(capturedResponses, null, 2));
}

module.exports = { init, setResponse, getResponse, hasResponse, flush };
```

**Files to update**:
- `.claude/agents/silent-runner.md`
- `.claude/agents/endpoint-runner.md`
- `.claude/commands/run-single.md`

---

### Phase 5: Preload Runtime Cache (MEDIUM PRIORITY)

**Impact**: 10-15% faster
**Effort**: ~30 minutes

Create `scripts/preload-cache.js`:
```javascript
const fs = require('fs');

const cache = {
  timestamp: Date.now(),
  entityRegistry: null,
  depGraph: null,
  existingData: {}
};

try {
  cache.entityRegistry = JSON.parse(
    fs.readFileSync('postman/entity-registry.json', 'utf8')
  );
} catch (e) {
  console.error('Failed to load entity-registry.json:', e.message);
  process.exit(1);
}

try {
  cache.depGraph = JSON.parse(
    fs.readFileSync('postman/dep-graph.json', 'utf8')
  );
} catch (e) {
  console.error('Failed to load dep-graph.json:', e.message);
  process.exit(1);
}

if (fs.existsSync('postman/existing-data.json')) {
  try {
    cache.existingData = JSON.parse(
      fs.readFileSync('postman/existing-data.json', 'utf8')
    );
  } catch (e) {
    // Non-critical, continue with empty
  }
}

fs.writeFileSync(
  'postman/runtime-cache.json',
  JSON.stringify(cache, null, 2)
);

console.log('✓ Runtime cache preloaded');
```

**Files to update**:
- `.claude/commands/run-single.md` - add preload step
- `scripts/data-reuse-service.js` - use runtime cache
- `scripts/generate-body.js` - use runtime cache

---

## Implementation Order

### Step 1: Collection Cache (Highest ROI)
1. Create `scripts/collection-cache.js`
2. Update all subagents to use it
3. Test: `time /run-single "Create a new member"`
4. Expected: 6-7s → 4-5s

### Step 2: Inline Auth Check
1. Update `.claude/commands/run-single.md`
2. Test auth cache works correctly
3. Expected: Additional 200-500ms saved

### Step 3: Entity Lookup Map
1. Update `scripts/generate-body.js`
2. Test body generation performance
3. Expected: Additional 5-10% faster

### Step 4: Response Buffering
1. Create `scripts/response-buffer.js`
2. Update subagents and run-single.md
3. Test multi-endpoint runs
4. Expected: Additional 20-30% faster

### Step 5: Runtime Cache
1. Create `scripts/preload-cache.js`
2. Update data-reuse-service and generate-body
3. Test cache preloading works
4. Expected: Additional 10-15% faster

---

## Expected Results

| Phase | Time Savings | Cumulative Improvement |
|-------|-------------|----------------------|
| Baseline | 0s | 0% |
| After Phase 1 | -2 to -3s | 30-40% faster |
| After Phase 2 | -0.2 to -0.5s | 35-45% faster |
| After Phase 3 | -0.3 to -0.5s | 40-48% faster |
| After Phase 4 | -0.5 to -1s | 48-58% faster |
| After Phase 5 | -0.3 to -0.5s | 50-65% faster |

**Total Expected**: 6-10s → 3-5s per endpoint

---

## Verification Tests

After each phase, run:
```bash
# Test basic endpoint
time /run-single "Create a new member"

# Test complex endpoint with dependencies
time /run-single "Get gym dashboard analytics"

# Test with cached auth
time /run-single "Get all members"
```

---

## Files Created/Modified

### New Files
- `scripts/collection-cache.js` - Shared collection cache
- `scripts/response-buffer.js` - Response buffering
- `scripts/preload-cache.js` - Runtime cache preloader

### Modified Files
- `.claude/commands/run-single.md` - Inline auth check, preload cache
- `.claude/agents/silent-runner.md` - Use caches
- `.claude/agents/faker-injector.md` - Use collection cache
- `.claude/agents/endpoint-runner.md` - Use caches
- `.claude/agents/collection-writer.md` - Use collection cache
- `scripts/generate-body.js` - Lookup map, runtime cache
- `scripts/data-reuse-service.js` - Runtime cache

---

## Risk Mitigation

1. **Backward Compatibility**: All changes are additive; no breaking changes
2. **Cache Invalidation**: 60-second TTL on collection cache prevents stale data
3. **Fallback Behavior**: All cache modules have fallback to original file reads
4. **Testing**: Each phase tested independently before proceeding

---

## Future Improvements (Out of Scope)

1. **Parallel Endpoint Execution**: Run independent support endpoints concurrently
2. **Automated Param Mapping**: Infer from dep-graph.json instead of manual mapping
3. **Incremental Collection Updates**: Only update modified endpoints
4. **WebSocket Support**: Real-time progress updates for long-running operations
