# Hardcoded Values Inventory

> Generated: 2026-09-08 — non-production defaults kept as-is per request.
> Purpose: single place to track every literal / fallback / default baked into the codebase so it is easy to externalize before production.
> Convention: `file:line` points to the source; `value` is the literal; `env override?` = whether an env var can replace it.

---

## 1. Default Credentials &amp; Secrets


| Value                                                                          | Location                                                                                                                     | Env override?                                            | Notes                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pass@123`                                                                     | `src/members/members.service.ts:103`, `src/trainers/trainers.service.ts:84`, `src/common/services/csv-import.service.ts:153` | No                                                       | Default password for every new Member / Trainer / CSV-imported user. Must be force-changed before prod. |
| `minioadmin` (accessKey)                                                       | `src/config/minio.config.ts:31`, `src/config/env.validation.ts:137`                                                          | Yes (`MINIO_ACCESS_KEY`) — blocked in prod by validation | Dev fallback.                                                                                           |
| `minioadmin` (secretKey)                                                       | `src/config/minio.config.ts:33`, `src/config/env.validation.ts:144`                                                          | Yes (`MINIO_SECRET_KEY`) — blocked in prod               | Dev fallback.                                                                                           |
| `replace-with-a-long-random-secret`                                            | `.env.example:2`                                                                                                             | Yes (`JWT_SECRET`, required, `min(32)`)                  | Placeholder secret.                                                                                     |
| `SecurePassword123!` / `SecurePass123!` / `Sup3rSecret!` / `NewSecurePass123!` | `src/auth/auth.controller.ts:89`, `src/auth/dto/register.dto.ts:22`, `src/auth/auth.service.spec.ts:46`                      | No                                                       | Swagger examples &amp; test fixtures only.                                                              |
| `usr_1234567890abcdef`                                                         | `src/auth/auth.controller.ts:62`, `src/users/users.controller.ts:107`                                                        | No                                                       | Swagger example userId.                                                                                 |


---

## 2. Auth / Token TTLs &amp; Crypto Constants


| Value                                    | Location                                                                                                                                                                                                                                                   | Meaning                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `bcrypt` rounds `10`                     | `src/auth/auth.service.ts:205,281`, `src/members/members.service.ts:104`, `src/trainers/trainers.service.ts:85`, `src/users/users.service.ts:32,181`, `src/common/services/csv-import.service.ts:153`, `src/database/seed_gym_Fitness_First_Elite.ts:1542` | Hash cost. Test file uses `4` for speed (`auth.service.spec.ts:18`). |
| `15 * 60 * 1000` (15 min)                | `src/auth/auth.service.ts:171`                                                                                                                                                                                                                             | Password-reset token expiry.                                         |
| `24 * 60 * 60 * 1000` (24 h)             | `src/auth/auth.service.ts:284`                                                                                                                                                                                                                             | Email verification token expiry.                                     |
| `+7 days` (`setDate(+7)`)                | `src/auth/auth.service.ts:338,382`                                                                                                                                                                                                                         | Refresh-token expiry (access + rotation).                            |
| `JWT_EXPIRES_IN = '1d'`                  | `src/config/env.validation.ts:30`, `src/auth/config/jwt.config.ts:9`, `.env.example:3`, `src/websocket/websocket.module.ts:10`                                                                                                                             | Default JWT expiry. Overridable via `JWT_EXPIRES_IN`.                |
| `Joi.string().min(32).required()`        | `src/config/env.validation.ts:29`                                                                                                                                                                                                                          | Minimum `JWT_SECRET` length.                                         |
| `crypto.randomBytes(32).toString('hex')` | `src/auth/auth.service.ts:170` (reset), `:282` (email verify)                                                                                                                                                                                              | Reset / verify token entropy (64 hex chars).                         |
| `crypto.randomBytes(40).toString('hex')` | `src/auth/auth.service.ts:336,380`                                                                                                                                                                                                                         | Refresh token entropy (80 hex chars).                                |
| `3600` (1 hour)                          | `src/upload/upload.service.ts:271,312,375`                                                                                                                                                                                                                 | Presigned PUT / GET URL expiry.                                      |
| `7 * 24 * 60 * 60 * 1000` (7 days)       | `src/renewals/renewals.service.ts:83`                                                                                                                                                                                                                      | Renewal invoice `due_date`.                                          |
| `+ 24 * 60 * 60 * 1000` (1 day)          | `src/renewals/renewals.service.ts:75`                                                                                                                                                                                                                      | Subscription start buffer when renewing.                             |
| `* 24 * 60 * 60 * 1000`                  | `src/renewals/renewals.service.ts:177`, `src/reminders/reminders.service.ts:255,461`                                                                                                                                                                       | `daysBetween` / plan duration conversion.                            |
| `86400000` (1 day ms)                    | `src/attendance/attendance.service.ts:340`                                                                                                                                                                                                                 | Streak detection (`current - previous === 86400000`).                |
| `23:59:59.999` / `23,59,59,999`          | `src/common/utils/subscription.util.ts:12`, `src/attendance/attendance.service.ts:246`, `src/analytics/analytics.service.ts:128`                                                                                                                           | End-of-day inclusive check for subscription liveness.                |
| `LessThan(new Date())`                   | `src/auth/auth.service.ts:219`                                                                                                                                                                                                                             | Expired-token cleanup query.                                         |
| `MoreThan(new Date())`                   | `src/auth/auth.service.ts:315`                                                                                                                                                                                                                             | Email-verify token validity check.                                   |


---

## 3. Infrastructure / Network / Ports / URLs


| Value                                                                      | Location                                                                                                         | Env override?                                                                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `PORT = 3000`                                                              | `src/config/env.validation.ts:20`, `src/main.ts:179,181`, `.env.example:4`, `dbConfig.ts:9`, `data-source.ts:11` | Yes (`PORT`). `main.ts` fallback `process.env.PORT ?? 3000`.                                            |
| `DATABASE_URL = postgresql://postgres:postgres@localhost:5432/gym_db`      | `.env.example:1`, `dbConfig.ts:9`, `data-source.ts:11`                                                           | Yes (`DATABASE_URL` / `POSTGRES_URL`).                                                                  |
| `CORS_ORIGINS = http://localhost:3000,http://127.0.0.1:3000`               | `.env.example:6`, `src/main.ts:76`, `src/config/env.validation.ts:31`                                            | Yes (`CORS_ORIGINS` CSV). Hardcoded as dev default.                                                     |
| `LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i` | `src/main.ts:15`, `src/config/env.validation.ts:3`                                                               | No                                                                                                      |
| `FRONTEND_URL = http://localhost:3000`                                     | `src/auth/auth.service.ts:181`                                                                                   | Yes (`FRONTEND_URL`) fallback for reset link: ``${FRONTEND_URL}/reset-password?token=${token}``.        |
| `SMTP_PORT = 587`                                                          | `src/config/env.validation.ts:63`, `.env.example:20`                                                             | Yes (`SMTP_PORT`).                                                                                      |
| `MINIO_ENDPOINT = localhost:9000`                                          | `src/config/minio.config.ts:29`, `.env.example:9`                                                                | Yes (`MINIO_ENDPOINT`).                                                                                 |
| `MINIO_PUBLIC_URL = http://localhost:9000`                                 | `src/config/minio.config.ts:37`, `.env.example:13`                                                               | Yes (`MINIO_PUBLIC_URL`).                                                                               |
| `MINIO_BUCKET = gym-media`                                                 | `src/config/minio.config.ts:34`, `src/upload/constants/upload.constants.ts:42`                                   | Yes (`MINIO_BUCKET`).                                                                                   |
| `MINIO_USE_SSL = false`                                                    | `src/config/minio.config.ts:38`, `src/config/env.validation.ts:60`, `.env.example:14`                            | Yes (`MINIO_USE_SSL` = `true`/`false`).                                                                 |
| `Body limit 1mb`                                                           | `src/main.ts:54,55`                                                                                              | No — `json({limit:'1mb'})` + `urlencoded({limit:'1mb'})`                                                |
| `helmet()`                                                                 | `src/main.ts:51`                                                                                                 | No — default helmet config.                                                                             |
| `Global prefix api/v1` (exclude `api`, `api/*path`)                        | `src/main.ts:106`                                                                                                | No                                                                                                      |
| `Swagger at /api`                                                          | `src/main.ts:168`                                                                                                | Gate: `SWAGGER_ENABLED` + `SWAGGER_ALLOWED_IPS` (prod).                                                 |
| `TWILIO_*` (empty default)                                                 | `.env.example:17-19`, `src/config/env.validation.ts:67-69`                                                       | Yes (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`). Null client when missing. |
| `synchronize = development || test`                                        | `dbConfig.ts:11`                                                                                                 | No — `data-source.ts` hard `synchronize:false`.                                                         |


---

## 4. Pagination, Throttling &amp; Cron


| Value                                                               | Location                                                                                                                        | Meaning                                                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global `ThrottlerModule.forRoot({ ttl:60000, limit:100 })`          | `src/app.module.ts:91-94`                                                                                                       | 100 req / 60s globally.                                                                                                                                   |
| `PaginationDto` defaults `page=1`, `limit=20`, `Max(100)`, `Min(1)` | `src/common/dto/pagination.dto.ts:6-24`, `src/config/env` not involved                                                          | Controller defaults `DefaultValuePipe(1)` / `DefaultValuePipe(20)` in ~30 controllers. Some use `10` (inquiries, diet/workout templates, goal schedules). |
| `paginate()`                                                        | `src/common/dto/pagination.dto.ts:50`                                                                                           | Returns `{data,total,page,limit,totalPages,hasNextPage,hasPreviousPage}`.                                                                                 |
| Per-endpoint `@Throttle`                                            | `src/auth/auth.controller.ts:45,132,165,214,236,253,275,316`                                                                    | `login 5/60s`, `forgot 3/60s`, `reset 5/60s`, `otp request/verify/register 3/60s`, `verify-email 5/60s`, `refresh 10/60s`.                                |
| `CronExpression.EVERY_DAY_AT_9AM`                                   | `src/reminders/reminders.service.ts:50`                                                                                         | Daily reminder sweep (expiry + dues + renewal follow-ups).                                                                                                |
| Reminder target days                                                | `src/reminders/reminders.service.ts:180` (`[7,3,1,0]` expiry), `:224` (`[1,3,7]` overdue), `:244` (`[2,4,6]` renewal follow-up) | Hardcoded cadence.                                                                                                                                        |


---

## 5. File Upload / Storage


| Value                                                                  | Location                                                                              | Meaning                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `MAX_FILE_SIZE = 10485760` (10 MB) fallback                            | `src/config/minio.config.ts:41`, `src/config/env.validation.ts:61`, `.env.example:15` | `parseInt(MAX_FILE_SIZE || '10485760')`. Env-overridable, Joi-validated.                        |
| `maxFiles = 5`                                                         | `src/config/minio.config.ts:42`                                                       | Max files per request (not env-tunable today).                                                  |
| `avatarMaxSize = 5 * 1024 * 1024` (5 MB)                               | `src/config/minio.config.ts:43`, `src/upload/upload.service.ts:60`                    |                                                                                                 |
| `documentMaxSize = 10 * 1024 * 1024` (10 MB)                           | `src/config/minio.config.ts:44`                                                       |                                                                                                 |
| `mediaMaxSize = 50 * 1024 * 1024` (50 MB)                              | `src/config/minio.config.ts:45`                                                       |                                                                                                 |
| `progress category maxSize = 10 * 1024 * 1024`                         | `src/upload/constants/upload.constants.ts:34`                                         |                                                                                                 |
| `ALLOWED_IMAGE_TYPES = [image/jpeg, image/png, image/webp, image/gif]` | `src/upload/constants/upload.constants.ts:2`                                          |                                                                                                 |
| `ALLOWED_DOCUMENT_TYPES = [application/pdf, image/jpeg, image/png]`    | `src/upload/constants/upload.constants.ts:8`                                          |                                                                                                 |
| `ALLOWED_VIDEO_TYPES = [video/mp4, video/webm]`                        | `src/upload/constants/upload.constants.ts:13`                                         |                                                                                                 |
| `FILE_CATEGORIES` → `folder` map                                       | `src/upload/constants/upload.constants.ts:16`                                         | `avatar→avatars`, `document→documents`, `media→templates`, `progress→progress`.                 |
| `MINIO_BUCKET = gym-media`                                             | `src/upload/constants/upload.constants.ts:42`                                         | Also `minioConfig.bucket` fallback.                                                             |
| Key pattern `folder/uuid.ext` / `folder/userId/uuid.ext`               | `src/upload/upload.service.ts:130,144`                                                | `randomUUID()` + `path.extname(...).toLowerCase()`.                                             |
| `Content-Type` passthrough                                             | `src/upload/upload.service.ts:169,216`                                                | From `file.mimetype`.                                                                           |
| `validateFileAccess` rules                                             | `src/upload/upload.service.ts:334-363`                                                | `SUPERADMIN/ADMIN` = all; others need `/${userId}/` in key; `TRAINER` also `templates/` prefix. |


---

## 6. Env Validation Defaults (Joi)


| Key                             | Default                                                      | Location               |
| ------------------------------- | ------------------------------------------------------------ | ---------------------- |
| `NODE_ENV`                      | `development` (`valid: development,test,staging,production`) | `env.validation.ts:17` |
| `PORT`                          | `3000`                                                       | `:20`                  |
| `JWT_EXPIRES_IN`                | `1d`                                                         | `:30`                  |
| `CORS_ORIGINS`                  | `''` (empty)                                                 | `:31`                  |
| `SWAGGER_ENABLED`               | `false`                                                      | `:32`                  |
| `SWAGGER_ALLOWED_IPS`           | `''`                                                         | `:33`                  |
| `FEATURE_ENABLE_*` (×7)         | `false`                                                      | `:34-54`               |
| `MINIO_USE_SSL`                 | `false`                                                      | `:60`                  |
| `MAX_FILE_SIZE`                 | `10485760`                                                   | `:61`                  |
| `SMTP_PORT`                     | `587`                                                        | `:63`                  |
| `DATABASE_URL` / `POSTGRES_URL` | `''` (one must be set, custom validator)                     | `:21-80`               |


Production gate (custom validator) additionally requires: `JWT_SECRET`, `CORS_ORIGINS` (no localhost), `MINIO_*`, `SMTP_*`, and rejects `minioadmin` + localhost `MINIO_ENDPOINT` (`env.validation.ts:71-161`).

---

## 7. Swagger / Example Placeholders (not runtime)

These are `@ApiProperty` examples only — safe to keep:

- Emails: `user@example.com`, `member@example.com`, `john.doe@example.com`, `alice.johnson@example.com`
- IDs: `usr_1234567890abcdef`, `gym_1234567890abcdef`, `workout_123456789`, `prog_123456789`, `TXN123456*`
- URLs: `https://example.com/avatars/alice.jpg`, `https://storage.example.com/progress/...`, `https://cdn.example.com/...`
- Phones: `+1234567890`, `+1-555-0101` (seed uses `+1-555-${pad4}` pattern)

---

## 8. Seed / Demo Data Literals


| Value                                                                                                         | Location                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Gym `Fitness First Elite`, branches `Downtown / Beverly Hills / Santa Monica / Pasadena`                      | `src/database/seed_gym_Fitness_First_Elite.ts:527-602` |
| Coords `34.0522,-118.2437` etc.                                                                               | `:531-602`                                             |
| Plans: prices `8999 / 23999 / 42999 / 79999 / 5999`, durations `30/90/180/365` days                           | `:624-650`                                             |
| `postalCode = 90000 + index`, `phone = +1-555-${8000+index}`, `avatar = https://i.pravatar.cc/150?img=${i+1}` | `:758-882`                                             |
| `dateOfBirth: 1985 + (index%20)`                                                                              | `:873`                                                 |
| `video_url / image_url = https://example.com/...`                                                             | `:2232-2233`                                           |


---

## 9. What To Do Before Production

- [ ] Replace `pass@123` with random temp password + forced reset (`hardcoded_value.md §1`).
- [ ] Set `JWT_SECRET` (≥32 chars), `CORS_ORIGINS`, `MINIO_*`, `SMTP_*`, `FRONTEND_URL` via secret manager — do not rely on fallbacks.
- [ ] Set `MAX_FILE_SIZE` / `JWT_EXPIRES_IN` / `FEATURE_ENABLE_*` explicitly in env.
- [ ] Rotate MinIO bucket / credentials away from `minioadmin` / `gym-media` defaults.
- [ ] Externalize throttling (`ttl/limit`) + pagination caps + cron schedule if they need tuning without a deploy.
- [ ] Revisit presigned-URL TTL (`3600`) and token TTLs (`15m / 24h / 7d`) against product requirements.

> Keep this file updated: when a new literal is added, append it here in the same table style.

