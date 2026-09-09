import * as Joi from 'joi';

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function splitCsv(input: unknown): string[] {
  if (typeof input !== 'string') {
    return [];
  }

  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .pattern(/^postgres(ql)?:\/\//)
    .allow('')
    .optional(),
  POSTGRES_URL: Joi.string()
    .pattern(/^postgres(ql)?:\/\//)
    .allow('')
    .optional(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('false'),
  SWAGGER_ALLOWED_IPS: Joi.string().allow('').default(''),
  FEATURE_ENABLE_REGISTRATION: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_EMAIL_VERIFICATION: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_REFRESH_TOKENS: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_BOOKING_SYSTEM: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_PAYMENT_GATEWAY: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_WEBSOCKET: Joi.string()
    .valid('true', 'false')
    .default('false'),
  FEATURE_ENABLE_SOFT_DELETE: Joi.string()
    .valid('true', 'false')
    .default('false'),
  S3_ENDPOINT: Joi.string().allow('').optional(),
  S3_REGION: Joi.string().allow('').default('us-east-1'),
  S3_BUCKET: Joi.string().allow('').optional(),
  S3_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  S3_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  S3_PUBLIC_URL: Joi.string().allow('').optional(),
  S3_FORCE_PATH_STYLE: Joi.string().valid('true', 'false').default('true'),
  MAX_FILE_SIZE: Joi.number().integer().positive().default(10485760),
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().allow('').optional(),
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),
  TWILIO_VERIFY_SERVICE_SID: Joi.string().allow('').optional(),
})
  .custom((value, helpers) => {
    const databaseUrl = [value.DATABASE_URL, value.POSTGRES_URL]
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .find((entry) => entry.length > 0);

    if (!databaseUrl) {
      return helpers.error('any.custom', {
        message: 'Either DATABASE_URL or POSTGRES_URL must be configured.',
      });
    }

    const isProduction = value.NODE_ENV === 'production';
    if (!isProduction) {
      return value;
    }

    const requiredInProduction = [
      'JWT_SECRET',
      'CORS_ORIGINS',
      'S3_BUCKET',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
    ];

    const missing = requiredInProduction.filter((key) => {
      const current = value[key];
      return typeof current !== 'string' || current.trim().length === 0;
    });

    if (missing.length > 0) {
      return helpers.error('any.custom', {
        message: `Missing required production environment variables: ${missing.join(', ')}`,
      });
    }

    const corsOrigins = splitCsv(value.CORS_ORIGINS);
    if (corsOrigins.length === 0) {
      return helpers.error('any.custom', {
        message:
          'CORS_ORIGINS must contain at least one non-localhost origin in production.',
      });
    }

    if (corsOrigins.some((origin) => LOCALHOST_ORIGIN_REGEX.test(origin))) {
      return helpers.error('any.custom', {
        message:
          'CORS_ORIGINS must not include localhost origins in production.',
      });
    }

    if (value.SWAGGER_ENABLED === 'true') {
      const swaggerAllowedIps = splitCsv(value.SWAGGER_ALLOWED_IPS);
      if (swaggerAllowedIps.length === 0) {
        return helpers.error('any.custom', {
          message:
            'SWAGGER_ALLOWED_IPS is required when SWAGGER_ENABLED=true in production.',
        });
      }
    }

    if (value.S3_ACCESS_KEY_ID === 'minioadmin') {
      return helpers.error('any.custom', {
        message:
          'S3_ACCESS_KEY_ID cannot use default insecure value in production.',
      });
    }

    if (value.S3_SECRET_ACCESS_KEY === 'minioadmin') {
      return helpers.error('any.custom', {
        message:
          'S3_SECRET_ACCESS_KEY cannot use default insecure value in production.',
      });
    }

    if (
      typeof value.S3_ENDPOINT === 'string' &&
      /(localhost|127\.0\.0\.1)/i.test(value.S3_ENDPOINT)
    ) {
      return helpers.error('any.custom', {
        message: 'S3_ENDPOINT must not point to localhost in production.',
      });
    }

    return value;
  }, 'Environment validation')
  .messages({
    'any.custom': '{{#message}}',
  })
  .unknown(true);
