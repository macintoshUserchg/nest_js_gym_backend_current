# `/run-single` Pipeline Optimization Plan (REVISED Feb 5, 2026)

## Summary of Revisions
Verified against actual codebase. Key corrections:

| Issue | Original Claim | Corrected Reality |
|-------|---------------|-------------------|
| Collection parsing | "7+ times per run" | 2-3 times per run |
| Phase 1 impact | 30-40% faster | 10-15% faster |
| Phase 2 savings | 200-500ms | 50-100ms |
| Phase 3 (lookup map) | Add new code | ✅ Already exists at lines 87-95 |
| Phase 4 impact | 20-30% faster | 5-10% (only for batch runs) |
| Phase 5 impact | 10-15% faster | May slow down single runs |
| **Total improvement** | 50-65% (3-5s) | **20-30% (5-8s)** |

## Performance Baseline
- **Current**: 6-10 seconds per endpoint
- **Target**: 5-8 seconds per endpoint (realistic)

## Optimization Phases

### Phase 1: Collection Cache Module (RECOMMENDED)
- **Impact**: 10-15% faster
- **Effort**: ~30 minutes
- Create `scripts/collection-cache.js` with 60-second TTL
- Update all subagents to use cached collection

### Phase 2: Inline Auth Cache Check (OPTIONAL)
- **Impact**: Saves 50-100ms
- **Effort**: ~20 minutes
- Replace Node process spawns with inline Bash
- Note: This is a feature addition, not pure optimization

### Phase 3: Entity Lookup Map (DONE - Already Implemented)
- **Status**: ✅ Function exists at `scripts/generate-body.js` lines 87-95
- No action needed

### Phase 4: Response Buffering (DEFERRED)
- **Impact**: 5-10% for batch runs only
- **Effort**: ~45 minutes
- Skip for now. Only implement if `/populate-all` performance becomes a concern

### Phase 5: Preload Runtime Cache (DEFERRED)
- **Impact**: May slow down single-endpoint runs
- **Effort**: ~30 minutes
- Defer. Current on-demand loading is simpler and more maintainable

## Recommended Implementation

**Only implement Phase 1** (Collection Cache) - best ROI with minimal complexity.

## New Files (Recommended)
- `scripts/collection-cache.js` - Shared collection cache

## Modified Files (Recommended)
- `.claude/agents/silent-runner.md` - Use collection cache
- `.claude/agents/faker-injector.md` - Use collection cache
- `.claude/agents/endpoint-runner.md` - Use collection cache
- `.claude/agents/collection-writer.md` - Use collection cache

## Expected Result: 20-30% faster overall (6-10s → 5-8s)

See `otimization_plan_run-single.md` in root for full details.
