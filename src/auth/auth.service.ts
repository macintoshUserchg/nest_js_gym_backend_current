import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import twilio = require('twilio');
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { UsersService } from '../users/users.service';
import { normalizePhoneNumber } from '../common/utils/phone.util';

@Injectable()
export class AuthService {
  private readonly twilioClient: twilio.Twilio | null;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.twilioClient =
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        : null;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.passwordHash) {
      throw new UnauthorizedException('Password login is not available');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: AuthJwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role.name,
    };
    return this.jwtService.sign(payload);
  }

  async requestMobileOtp(phoneNumber: string) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const user =
      await this.usersService.findOtpEligibleUserByPhone(normalizedPhone);

    if (!user) {
      throw new UnauthorizedException(
        'No OTP-enabled account found for this mobile number',
      );
    }

    const client = this.getTwilioClient();
    try {
      await client.verify.v2
        .services(this.getVerifyServiceSid())
        .verifications.create({
          to: normalizedPhone,
          channel: 'sms',
        });
    } catch (error) {
      this.throwOtpProviderError(error);
    }

    return {
      message: 'OTP sent successfully',
      phoneNumber: normalizedPhone,
    };
  }

  async verifyMobileOtp(phoneNumber: string, code: string) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const client = this.getTwilioClient();
    let verificationCheck;
    try {
      verificationCheck = await client.verify.v2
        .services(this.getVerifyServiceSid())
        .verificationChecks.create({
          to: normalizedPhone,
          code,
        });
    } catch (error) {
      this.throwOtpProviderError(error);
    }

    if (verificationCheck.status !== 'approved') {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user =
      await this.usersService.findOtpEligibleUserByPhone(normalizedPhone);
    if (!user) {
      throw new UnauthorizedException('User is not eligible for OTP login');
    }

    if (!user.phoneVerifiedAt) {
      await this.usersService.update(user.userId, {
        phoneVerifiedAt: new Date(),
      });
    }

    const token = await this.login(user);
    return {
      userid: user.userId,
      access_token: token,
    };
  }

  private getTwilioClient() {
    if (!this.twilioClient) {
      throw new ServiceUnavailableException(
        'Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.',
      );
    }

    return this.twilioClient;
  }

  private getVerifyServiceSid() {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!serviceSid) {
      throw new ServiceUnavailableException(
        'Twilio Verify is not configured. Set TWILIO_VERIFY_SERVICE_SID.',
      );
    }

    return serviceSid;
  }

  private throwOtpProviderError(error: unknown): never {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      const message =
        'message' in error && typeof error.message === 'string'
          ? error.message
          : 'OTP provider request failed';

      if (error.status >= 400 && error.status < 500) {
        throw new BadRequestException(message);
      }
    }

    throw new ServiceUnavailableException(
      'OTP provider is currently unavailable. Please try again later.',
    );
  }
}
