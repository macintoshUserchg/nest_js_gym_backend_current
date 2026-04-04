import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    ConfigModule,
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebSocketModule {}
