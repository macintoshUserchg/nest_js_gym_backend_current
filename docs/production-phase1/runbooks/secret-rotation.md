# Secret Rotation Runbook

## Scope
Rotate all active credentials before pilot go-live.

## Rotation targets
- JWT signing secret (`JWT_SECRET`)
- Postgres credentials (`DATABASE_URL`)
- S3 credentials (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`)
- SMTP credentials (`SMTP_USER`, `SMTP_PASS`)
- Any third-party API keys in use

## Procedure
1. Generate new secrets in approved vault.
2. Update `staging` variables first.
3. Run smoke tests in staging.
4. Schedule production rotation window.
5. Update production variables.
6. Redeploy service.
7. Validate login, upload, notification email, and payments.
8. Invalidate old credentials.

## Verification checklist
- Auth flows work with new JWT secret.
- DB connectivity healthy via `/health/ready`.
- Uploads and presigned URLs still work.
- Email notifications send successfully.

## Rollback
- Reapply last known-good secret set from vault version history.
- Redeploy previous stable build if needed.
