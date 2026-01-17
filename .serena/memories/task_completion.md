# Task Completion Checklist for new-nestjs-gym-app

## Before Marking Task Complete

### 1. Code Quality Checks
- [ ] Run `npm run format` to format all code
- [ ] Run `npm run lint` to lint and auto-fix issues
- [ ] Ensure no new TypeScript errors

### 2. Testing
- [ ] Run `npm run test` for unit tests
- [ ] Verify all tests pass
- [ ] Check test coverage is maintained

### 3. Build Verification
- [ ] Run `npm run build` to verify compilation
- [ ] Ensure no build errors

### 4. Type Safety
- [ ] Run `npx tsc --noEmit` for type checking
- [ ] Fix any type errors

## When Adding New Features

### Files to Consider
- [ ] Create module file (`src/<module>/<module>.module.ts`)
- [ ] Create controller file (`src/<module>/<module>.controller.ts`)
- [ ] Create service file (`src/<module>/<module>.service.ts`)
- [ ] Create DTOs in `src/<module>/dto/`
- [ ] Create entity in `src/entities/`
- [ ] Add entity to database configuration
- [ ] Register module in `app.module.ts`

### Database Changes
- [ ] Review dbConfig.ts if changing entities
- [ ] Consider if migration is needed (for production)
- [ ] Update seed data if needed

### API Documentation
- [ ] Add Swagger decorators to endpoints
- [ ] Test endpoints in Swagger UI

## When Fixing Bugs

### Verification Steps
- [ ] Reproduce the bug
- [ ] Apply fix
- [ ] Verify fix resolves the issue
- [ ] Run related tests
- [ ] Check for regressions

## When Modifying Existing Code

### Impact Analysis
- [ ] Identify all files affected
- [ ] Check for breaking changes
- [ ] Update dependent code
- [ ] Update tests if needed
- [ ] Run full test suite

## Commit and Push

### Before Commit
- [ ] Review changes with `git diff`
- [ ] Ensure commit message follows conventions
- [ ] Include relevant issue/ticket number

### After Commit
- [ ] Push to remote: `git push origin <branch-name>`
- [ ] Create/pull request if applicable

## Performance Considerations

- [ ] Check for N+1 queries in database access
- [ ] Verify indexes exist for frequently queried columns
- [ ] Consider pagination for large result sets
- [ ] Review query performance for complex operations

## Security Checklist

- [ ] Validate all inputs with DTOs
- [ ] Use proper authorization checks
- [ ] Never expose sensitive data in responses
- [ ] Hash passwords before storage
- [ ] Use parameterized queries (TypeORM handles this)
