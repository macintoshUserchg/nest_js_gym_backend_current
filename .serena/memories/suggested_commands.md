# Suggested Commands for new-nestjs-gym-app

## Development Commands

```bash
# Start dev server with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug

# Build for production
npm run build

# Run production build
npm run start:prod
```

## Code Quality Commands

```bash
# Lint and auto-fix code
npm run lint

# Format code with Prettier
npm run format
```

## Testing Commands

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Database Commands (TypeORM)

```bash
# Note: synchronize: true is enabled in development
# For production, disable sync and use migrations:

# Create a new migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run typeorm migration:run
```

## Git Commands (Darwin)

```bash
# Check git status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "message"

# Create and push to new branch
git checkout -b branch-name
git push -u origin branch-name

# Pull changes
git pull origin branch-name
```

## Database Management

```bash
# View database schema (requires psql or DB tool)
psql postgresql://user:password@host:5432/database

# Run database seeds
# Check src/database/ directory for seed scripts
```

## API Documentation

- Swagger UI: http://localhost:3000/api (when server is running)

## Utility Commands

```bash
# List files in directory
ls -la

# Find file by name
find . -name "filename"

# Search for pattern in files
grep -r "pattern" src/

# Check TypeScript compilation
npx tsc --noEmit
```
