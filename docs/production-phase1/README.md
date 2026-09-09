# Phase 1 Production Readiness (Internal Pilot)

Audit date: April 5, 2026.

## Required backend gates
- `npm run build`
- `npm run lint:critical`
- `npm test -- --runInBand`
- `npm run test:e2e:ci`
- `npm audit --omit=dev --audit-level=high`

Single command:
- `npm run prod:checklist`

Local prerequisite for e2e:
- Ensure `TEST_DATABASE_URL` points to an existing isolated DB (default fallback: `gym_db_test`).

## Health endpoints
- `GET /health/live`
- `GET /health/ready`
- `GET /health` (legacy compatibility endpoint)

## Migration + promotion order
1. Deploy candidate build to `staging`.
2. Run `npm run migration:run:prod` in staging environment.
3. Run staging smoke suite (auth, members, invoices/payments, renewals/reminders, uploads, health probes).
4. Execute rollback drill in staging (`migration:revert:prod` + previous app version).
5. Run Railway migration gate workflow for `production`.
6. Promote/deploy app only after migration gate succeeds.

## Key docs
- [Railway Environments](./railway/environments.md)
- [Risk Register](./risk-register.md)
- [Pilot Rollout Plan](./pilot-rollout.md)
- [Rollback Runbook](./runbooks/rollback.md)
- [Secret Rotation Runbook](./runbooks/secret-rotation.md)
- [DB Restore Runbook](./runbooks/db-restore.md)
- [Incident Triage Runbook](./runbooks/incident-triage.md)
