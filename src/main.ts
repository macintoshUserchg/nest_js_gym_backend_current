import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Body size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin:
      corsOrigins.length > 0
        ? corsOrigins
        : [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/],
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

  // Swagger doc builder
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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
