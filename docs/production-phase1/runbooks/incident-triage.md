# Incident Triage Runbook

## Severity levels
- Sev-1: Production unavailable / data loss risk
- Sev-2: Major flow degraded
- Sev-3: Partial feature degradation

## First 15 minutes
1. Assign roles: incident commander, comms owner, ops executor.
2. Capture current deploy version + migration version.
3. Check:
   - `/health/live`
   - `/health/ready`
   - auth/login path
   - DB connectivity
4. Decide rollback vs hotfix path.

## Observability checklist
- App logs (Railway)
- DB connection errors and lock contention
- HTTP 4xx/5xx spikes by endpoint
- Auth/token failure rates

## Escalation policy
- Sev-1: page on-call immediately; leadership notified within 10 minutes.
- Sev-2: on-call + product owner notified within 30 minutes.
- Sev-3: ticket + next business-day follow-up.
