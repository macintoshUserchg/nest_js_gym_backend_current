import { randomUUID } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = { randomUUID } as Crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import helmet from 'helmet';
import { json, urlencoded, NextFunction, Request, Response } from 'express';

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function splitCsv(input: string | undefined): string[] {
  if (!input) {
    return [];
  }

  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeIp(ipAddress: string): string {
  return ipAddress.replace('::ffff:', '').trim();
}

function getRequestIp(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const firstForwardedIp = forwardedFor.split(',')[0];
    return normalizeIp(firstForwardedIp || '');
  }

  return normalizeIp(request.ip || '');
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // Security headers
  app.use(helmet());

  // Body size limits
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  const configuredCorsOrigins = splitCsv(process.env.CORS_ORIGINS);
  if (isProduction && configuredCorsOrigins.length === 0) {
    throw new Error(
      'CORS_ORIGINS must be explicitly configured in production.',
    );
  }

  if (
    isProduction &&
    configuredCorsOrigins.some((origin) => LOCALHOST_ORIGIN_REGEX.test(origin))
  ) {
    throw new Error(
      'CORS_ORIGINS cannot include localhost origins in production.',
    );
  }

  const corsOrigins =
    configuredCorsOrigins.length > 0
      ? configuredCorsOrigins
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = new Set(corsOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin '${origin}' is not allowed`));
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // API versioning
  app.setGlobalPrefix('api/v1', { exclude: ['api', 'api/*path'] });

  const swaggerEnabled =
    !isProduction || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    if (isProduction) {
      const allowedSwaggerIps = splitCsv(process.env.SWAGGER_ALLOWED_IPS).map(
        normalizeIp,
      );
      if (allowedSwaggerIps.length === 0) {
        throw new Error(
          'SWAGGER_ALLOWED_IPS must be configured when enabling Swagger in production.',
        );
      }

      const allowedSwaggerIpSet = new Set(allowedSwaggerIps);
      app.use('/api', (req: Request, res: Response, next: NextFunction) => {
        const requestIp = getRequestIp(req);
        if (!allowedSwaggerIpSet.has(requestIp)) {
          res.status(403).json({ message: 'Swagger access denied' });
          return;
        }

        next();
      });
    }

    const config = new DocumentBuilder()
      .setTitle('Gym Management System')
      .setDescription('API documentation for the Gym Management System')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('gyms', 'Gym management endpoints')
      .addTag('branches', 'Branch management endpoints')
      .addTag('members', 'Member management endpoints')
      .addTag('membership-plans', 'Membership plan management endpoints')
      .addTag('subscriptions', 'Subscription management endpoints')
      .addTag('classes', 'Class management endpoints')
      .addTag('trainers', 'Trainer management endpoints')
      .addTag('assignments', 'Member-trainer assignment endpoints')
      .addTag('attendance', 'Attendance tracking endpoints')
      .addTag('audit-logs', 'Audit logs endpoints')
      .addTag('analytics', 'Analytics and dashboard endpoints')
      .addTag('roles', 'Role management endpoints')
      .addTag('invoices', 'Invoice management endpoints')
      .addTag('payments', 'Payment transaction endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log('Swagger enabled at /api');
  } else {
    logger.log('Swagger disabled');
  }

  await app.listen(process.env.PORT ?? 3000);
  logger.log(
    `Gym API started in ${nodeEnv} on port ${process.env.PORT ?? 3000}`,
  );
}
void bootstrap();
