# Railway Environment Topology

## Required environments
- `staging`
- `production`

Each environment must have:
- Separate Railway service variables
- Separate Postgres instance/database
- Independent backup and restore targets

## Required variables (minimum)
- `NODE_ENV`
- `JWT_SECRET`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_URL`
- `S3_FORCE_PATH_STYLE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `FEATURE_ENABLE_REFRESH_TOKENS`
- `SWAGGER_ENABLED`
- `SWAGGER_ALLOWED_IPS`

## Setup checklist
1. Create `staging` and `production` environments.
2. Attach unique Postgres per environment.
3. Load environment variables from a secrets manager (never from `.env`).
4. Validate readiness endpoint in each env:
   - `/health/live` returns 200
   - `/health/ready` returns 200
5. Enable daily database backups in both environments.
