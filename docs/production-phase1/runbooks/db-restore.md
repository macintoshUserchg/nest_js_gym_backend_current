# Database Restore Runbook

## Backup policy
- Daily automatic backups enabled in Railway for staging and production.
- Retention period aligned with pilot compliance policy.

## Restore drill (staging)
1. Select latest backup snapshot.
2. Restore into staging Postgres clone.
3. Point staging app to restored DB.
4. Run smoke tests.
5. Record RTO/RPO and issues.

## Production restore steps
1. Announce maintenance window.
2. Freeze write operations if needed.
3. Restore selected snapshot to production DB.
4. Run `migration:run:prod` if schema drift exists.
5. Verify data integrity and smoke tests.

## Mandatory checks
- User login works.
- Latest expected invoices/payments are present.
- Recent reminder logs exist.
- Upload metadata records remain consistent.
