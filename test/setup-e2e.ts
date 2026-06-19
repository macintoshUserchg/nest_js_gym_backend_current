process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-key-should-be-long-enough-12345';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://chandangaur@localhost:5432/gym_db_test';
