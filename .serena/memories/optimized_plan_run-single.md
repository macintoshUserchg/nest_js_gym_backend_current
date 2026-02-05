# `/run-single` Pipeline Optimization Plan

## Overview
Optimize the `/run-single` Postman collection populator pipeline to reduce execution time by 40-50%.

## Performance Baseline
- **Current**: 6-10 seconds per endpoint
- **Target**: 3-5 seconds per endpoint

## Five Optimization Phases

### Phase 1: Collection Cache Module (30-40% faster)
Create `scripts/collection-cache.js` with 60-second TTL. Update all subagents to use cached collection instead of parsing JSON 7+ times per run.

### Phase 2: Inline Auth Cache Check (saves 200-500ms)
Replace Node process spawns in `.claude/commands/run-single.md` with inline Bash logic for token validation.

### Phase 3: Entity Registry Lookup Map (5-10% faster)
Update `scripts/generate-body.js` to build O(1) lookup map instead of O(n) loops.

### Phase 4: Response Buffering (20-30% faster)
Create `scripts/response-buffer.js` to buffer writes in memory, flush once at end.

### Phase 5: Preload Runtime Cache (10-15% faster)
Create `scripts/preload-cache.js` to load all configs once at pipeline start.

## Implementation Order
1. Collection cache (highest ROI)
2. Inline auth check
3. Entity lookup map
4. Response buffering
5. Runtime cache preloader

## New Files
- `scripts/collection-cache.js`
- `scripts/response-buffer.js`
- `scripts/preload-cache.js`

## Modified Files
- `.claude/commands/run-single.md`
- `.claude/agents/silent-runner.md`
- `.claude/agents/faker-injector.md`
- `.claude/agents/endpoint-runner.md`
- `.claude/agents/collection-writer.md`
- `scripts/generate-body.js`
- `scripts/data-reuse-service.js`

## Expected Result: 50-65% faster overall (6-10s → 3-5s)

See `otimization_plan_run-single.md` in root for full details.
