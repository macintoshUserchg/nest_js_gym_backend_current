import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

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
