# Rollback Runbook

## Trigger conditions
- Elevated 5xx error rate
- Auth failures > threshold
- Data corruption risk
- Critical user journey regression

## Immediate actions
1. Declare incident and assign incident commander.
2. Halt rollout expansion.
3. Revert app to previous stable Railway deployment.
4. If migration caused failure, run `npm run migration:revert:prod`.
5. Validate core smoke flows.

## Validation after rollback
- `/health/live` and `/health/ready` return 200.
- Login + role routing succeed.
- Member/invoice/payment flows succeed.
- Reminder/upload flows succeed.

## Communication
- Update internal pilot channel every 15 minutes until stable.
- Share root-cause hypothesis and mitigation before resuming rollout.
