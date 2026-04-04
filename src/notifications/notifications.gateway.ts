import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedClients.set(userId, client);
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${userId} (${client.id})`);
      client.emit('connected', {
        userId,
        message: 'Connected to notifications',
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.connectedClients.entries()) {
      if (socket.id === client.id) {
        this.connectedClients.delete(userId);
        this.logger.log(`Client disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToUsers(userIds: string[], event: string, data: unknown) {
    for (const userId of userIds) {
      this.sendToUser(userId, event, data);
    }
  }

  sendToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  sendNotification(userId: string, notification: unknown) {
    this.sendToUser(userId, 'notification', notification);
  }

  sendReminder(userId: string, reminder: unknown) {
    this.sendToUser(userId, 'reminder', reminder);
  }

  sendPaymentUpdate(userId: string, payment: unknown) {
    this.sendToUser(userId, 'payment_update', payment);
  }

  sendBookingUpdate(userId: string, booking: unknown) {
    this.sendToUser(userId, 'booking_update', booking);
  }

  sendAttendanceUpdate(userId: string, attendance: unknown) {
    this.sendToUser(userId, 'attendance_update', attendance);
  }

  getConnectedCount(): number {
    return this.connectedClients.size;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedClients.has(userId);
  }
}
