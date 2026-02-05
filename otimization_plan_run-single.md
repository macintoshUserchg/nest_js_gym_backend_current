# `/run-single` Pipeline Optimization Plan (REVISED)

## Summary of Revisions (Feb 5, 2026)

This plan was verified against the actual codebase. Key corrections made:

| Issue | Original Claim | Corrected Reality |
|-------|---------------|-------------------|
| Collection parsing | "7+ times per run" | 2-3 times per run |
| Phase 1 impact | 30-40% faster | 10-15% faster |
| Phase 2 savings | 200-500ms | 50-100ms |
| Phase 3 (lookup map) | Add new code | ✅ **Already exists** at lines 87-95 |
| Phase 4 impact | 20-30% faster | 5-10% (only for batch runs) |
| Phase 5 impact | 10-15% faster | May **slow down** single runs |
| **Total improvement** | 50-65% (3-5s) | **20-30% (5-8s)** |

**Recommended Action**: Only implement Phase 1 (Collection Cache). Defer Phases 4-5. Phase 3 is already done.

---

## Overview
This document outlines the optimization strategy for the `/run-single` Postman collection populator pipeline.

## Performance Baseline
- **Current**: Typical endpoint run takes 6-10 seconds
- **Target**: Reduce to 4-7 seconds (30-40% faster)

## Root Causes Identified (Verified against codebase)

### 1. Collection Parsing in Multiple Agents
- Collection is parsed 2-3 times per run (not 7+ as previously estimated)
- Each agent (silent-runner, faker-injector) reads raw-collection.json independently
- ~50-200KB JSON parsed per agent

### 2. Repeated Config File Reads
- entity-registry.json, dep-graph.json read multiple times across scripts
- Each script independently loads and parses these configs

### 3. Response File I/O Overhead
- captured-responses.json written after each support endpoint
- Multiple small file writes instead of buffered writes

### 4. Auth Token Cache Check (Minor)
- Node process spawn for cache validation (~50-100ms, not 200-500ms)

## Optimization Strategy

### Phase 1: Collection Cache Module (HIGH PRIORITY)

**Impact**: 10-15% faster overall
**Effort**: ~30 minutes

**Note**: Verified against codebase - collection is parsed 2-3 times per run, not 7+. Original estimate was exaggerated.

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

### Phase 2: Inline Auth Cache Check (MEDIUM PRIORITY)

**Impact**: Saves 50-100ms per run
**Effort**: ~20 minutes

**Note**: This is primarily a feature addition (inline bash doesn't exist yet) rather than pure optimization. Current approach uses Node processes which have ~50-100ms spawn overhead.

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

### Phase 3: ~~Entity Registry Lookup Map~~ (SKIPPED - Already Implemented)

**Status**: ✅ ALREADY EXISTS in `scripts/generate-body.js` lines 87-95

```javascript
// This function already exists - no action needed
function getEntityByCollectionEndpoint(endpointName) {
  for (const [entityName, config] of Object.entries(entityRegistry.entities)) {
    if (config.collectionEndpoint === endpointName) {
      return { name: entityName, ...config };
    }
  }
  return null;
}
```

**Note**: The original plan suggested adding O(1) lookup map, but this O(n) lookup function already exists and performs adequately given the small number of entities (29).

---

### Phase 4: Response Buffering (LOW PRIORITY)

**Impact**: 5-10% faster for multi-endpoint runs, minimal for single endpoint
**Effort**: ~45 minutes

**Note**: Original estimate of 20-30% was exaggerated. For typical single-endpoint runs (3-5 support endpoints), incremental writes provide better debugging visibility. Benefit is only realized for `/populate-all` (285+ endpoints).

**Recommendation**: Skip for now. Only implement if `/populate-all` performance becomes a concern.

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

### Phase 5: Preload Runtime Cache (DEFERRED)

**Impact**: May slow down single-endpoint runs, marginal benefit for batch runs
**Effort**: ~30 minutes

**Note**: Files are already read on-demand by scripts that need them. Adding a preloader:
- Adds startup overhead for single-endpoint runs
- More complexity and maintenance burden
- entity-registry.json, dep-graph.json are small (<100KB total), read time is negligible

**Recommendation**: Defer. Only consider if profiling shows file I/O is actually a bottleneck.

**For now**: Current on-demand loading approach is simpler and more maintainable.

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

## Implementation Order (REVISED)

### Step 1: Collection Cache (Highest ROI)
1. Create `scripts/collection-cache.js`
2. Update all subagents to use it
3. Test: `time /run-single "Create a new member"`
4. Expected: 6-7s → 5-6s

### Step 2: Inline Auth Check (Optional)
1. Update `.claude/commands/run-single.md`
2. Test auth cache works correctly
3. Expected: Additional 50-100ms saved

### Step 3: ~~Entity Lookup Map~~ (SKIPPED - Already Implemented)
- No action needed. Function `getEntityByCollectionEndpoint` exists at lines 87-95 in generate-body.js

### Step 4: Response Buffering (Deferred)
- Skip for now. Only implement if `/populate-all` performance becomes a concern

### Step 5: Runtime Cache (Deferred)
- Defer. Profile first to confirm file I/O is actually a bottleneck

---

## Expected Results (REVISED)

| Phase | Time Savings | Cumulative Improvement | Status |
|-------|-------------|----------------------|--------|
| Baseline | 0s | 0% | - |
| After Phase 1 | -0.5 to -1s | 10-15% faster | Recommended |
| After Phase 2 | -0.05 to -0.1s | 11-16% faster | Optional |
| After Phase 3 | 0s | No change | ✅ Already done |
| After Phase 4 | Minimal | Only for `/populate-all` | Deferred |
| After Phase 5 | Negative (slower) | Not recommended | Deferred |

**Realistic Total**: 6-10s → 5-8s per endpoint (20-30% faster with Phase 1)

**Note**: Original estimate of 50-65% faster (3-5s) was overly optimistic.

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

## Files Created/Modified (REVISED)

### New Files (Recommended)
- `scripts/collection-cache.js` - Shared collection cache (Phase 1)

### New Files (Optional/Deferred)
- `scripts/response-buffer.js` - Response buffering (Phase 4 - Deferred)
- `scripts/preload-cache.js` - Runtime cache preloader (Phase 5 - Deferred)

### Modified Files (Recommended)
- `.claude/agents/silent-runner.md` - Use collection cache
- `.claude/agents/faker-injector.md` - Use collection cache
- `.claude/agents/endpoint-runner.md` - Use collection cache
- `.claude/agents/collection-writer.md` - Use collection cache

### Modified Files (Optional)
- `.claude/commands/run-single.md` - Inline auth check (Phase 2 - Optional)

### Modified Files (No Action Needed)
- `scripts/generate-body.js` - Lookup function already exists (Phase 3 - Done)
- `scripts/data-reuse-service.js` - No changes needed for Phase 1-2

---

## Risk Mitigation

1. **Backward Compatibility**: All changes are additive; no breaking changes
2. **Cache Invalidation**: 60-second TTL on collection cache prevents stale data
3. **Fallback Behavior**: All cache modules have fallback to original file reads
4. **Testing**: Each phase tested independently before proceeding
5. **Complexity**: Phases 4-5 deferred to avoid unnecessary complexity for marginal gains

---

## Revision History

| Date | Change |
|------|--------|
| Feb 5, 2026 | Initial plan created with optimistic estimates |
| Feb 5, 2026 | **REVISED** - Verified against actual codebase, corrected estimates, removed already-implemented code |

---

## Future Improvements (Out of Scope)

1. **Parallel Endpoint Execution**: Run independent support endpoints concurrently
2. **Automated Param Mapping**: Infer from dep-graph.json instead of manual mapping
3. **Incremental Collection Updates**: Only update modified endpoints
4. **WebSocket Support**: Real-time progress updates for long-running operations
