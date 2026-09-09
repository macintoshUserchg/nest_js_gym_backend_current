# Phase 1 Risk Register

## Current gate status (as of April 5, 2026)
- Build: pass
- Critical lint profile: pass
- Unit tests: pass
- E2E tests: pass (requires isolated test DB)
- Production dependency audit: **fail** (`4 high` vulnerabilities from transitive chains)

## Open release blockers
1. `npm audit --omit=dev --audit-level=high` is failing on high-severity transitive vulnerabilities (`lodash`, `path-to-regexp`) through Nest dependencies.
2. Railway `staging` and `production` environments must be provisioned and validated.
3. Secret rotation must be executed in vault + Railway variables before pilot release.
4. Release keystore material must be provisioned on CI/secure build host.

## Mitigation actions
- Track dependency remediation path in a dedicated ticket and evaluate safe upgrades/overrides.
- Use migration gate workflow before any production promotion.
- Enforce canary-first pilot rollout with 24-48h monitoring hold.
- Keep rollback and DB restore drills current in staging.
