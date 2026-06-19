import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private client: ReturnType<typeof twilio> | null = null;
  private fromNumber: string | undefined;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.logger.warn(
        'Twilio credentials not configured. SMS will be logged to console instead.',
      );
    }
  }

  async sendSMS(phone: string, message: string): Promise<{ sid: string }> {
    try {
      if (!this.client) {
        this.logger.log(`[SMS MOCK] To: ${phone} | Message: ${message}`);
        return { sid: `mock_${Date.now()}` };
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phone,
      });

      this.logger.log(`SMS sent to ${phone}: ${result.sid}`);
      return { sid: result.sid };
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phone}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to send SMS: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async verifyPhone(
    phone: string,
    code: string,
  ): Promise<{ status: string; valid: boolean }> {
    try {
      if (!this.client) {
        this.logger.log(`[VERIFY MOCK] Phone: ${phone} | Code: ${code}`);
        return { status: 'mock_verified', valid: true };
      }

      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID || 'default')
        .verificationChecks.create({ to: phone, code });

      const isValid = verificationCheck.status === 'approved';
      this.logger.log(
        `Phone verification for ${phone}: ${verificationCheck.status}`,
      );

      return { status: verificationCheck.status, valid: isValid };
    } catch (error) {
      this.logger.error(
        `Failed to verify phone ${phone}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to verify phone: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
