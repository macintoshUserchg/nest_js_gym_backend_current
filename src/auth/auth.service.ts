import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import twilio = require('twilio');
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { UsersService } from '../users/users.service';
import { normalizePhoneNumber } from '../common/utils/phone.util';
import { PasswordResetToken } from '../entities/password_reset_tokens.entity';
import { EmailService } from '../email/email.service';
import { Role } from '../entities/roles.entity';
import { User } from '../entities/users.entity';
import { RefreshToken } from '../entities/refresh_tokens.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly twilioClient: twilio.Twilio | null;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
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

  async forgotPassword(email: string) {
    // Always return success to prevent email enumeration
    const successResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return successResponse;
    }

    // Invalidate any existing unused tokens for this user
    await this.resetTokenRepo.update(
      { user: { userId: user.userId }, used: false },
      { used: true },
    );

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const resetToken = this.resetTokenRepo.create({
      user,
      token,
      expiresAt,
    });
    await this.resetTokenRepo.save(resetToken);

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(email, resetUrl);

    return successResponse;
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > resetToken.expiresAt) {
      // Mark expired token as used
      resetToken.used = true;
      await this.resetTokenRepo.save(resetToken);
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(resetToken.user.userId, {
      passwordHash: hashedPassword,
    });

    // Mark token as used
    resetToken.used = true;
    await this.resetTokenRepo.save(resetToken);

    return { message: 'Password has been reset successfully' };
  }

  async cleanupExpiredTokens() {
    const result = await this.resetTokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    return { deleted: result.affected || 0 };
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

  async register(email: string, password: string, phoneNumber?: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const memberRole = await this.roleRepo.findOne({
      where: { name: 'MEMBER' },
    });
    if (!memberRole) {
      throw new BadRequestException('MEMBER role not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: memberRole,
      phoneNumber: phoneNumber ? normalizePhoneNumber(phoneNumber) : undefined,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
    });

    const savedUser = await this.userRepo.save(user);

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    await this.emailService.sendWelcomeEmail(email, email);

    const { passwordHash, ...result } = savedUser;
    const token = this.jwtService.sign({
      sub: result.userId,
      email: result.email,
      role: memberRole.name,
    });

    return { user: result, access_token: token };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await this.userRepo.save(user);

    return { message: 'Email verified successfully' };
  }

  async generateRefreshToken(
    user: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokenRepo.create({
      user: { userId: user.userId },
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.refreshTokenRepo.save(refreshToken);
    return token;
  }

  async refreshAccessToken(
    oldRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { token: oldRefreshToken },
      relations: ['user', 'user.role'],
    });

    if (!refreshToken || refreshToken.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshToken.expiresAt) {
      refreshToken.isRevoked = true;
      await this.refreshTokenRepo.save(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = refreshToken.user;
    const payload: AuthJwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role.name,
    };
    const newAccessToken = this.jwtService.sign(payload);

    const newToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const newRefreshToken = this.refreshTokenRepo.create({
      user: { userId: user.userId },
      token: newToken,
      expiresAt: newExpiresAt,
      ipAddress,
      userAgent,
      replacedByToken: newToken,
    });

    refreshToken.isRevoked = true;
    refreshToken.replacedByToken = newToken;
    await this.refreshTokenRepo.save(refreshToken);
    await this.refreshTokenRepo.save(newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newToken,
    };
  }

  async revokeRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { token },
    });

    if (!refreshToken) {
      throw new BadRequestException('Invalid token');
    }

    refreshToken.isRevoked = true;
    await this.refreshTokenRepo.save(refreshToken);
    return { message: 'Token revoked successfully' };
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepo.update(
      { user: { userId }, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'All sessions revoked' };
  }

  async getActiveSessions(userId: string) {
    const tokens = await this.refreshTokenRepo.find({
      where: { user: { userId }, isRevoked: false },
      select: [
        'id',
        'token',
        'expiresAt',
        'ipAddress',
        'userAgent',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });

    return tokens.map((t) => ({
      id: t.id,
      token: t.token.slice(-8),
      expiresAt: t.expiresAt,
      ipAddress: t.ipAddress,
      userAgent: t.userAgent,
      createdAt: t.createdAt,
      isCurrent: new Date() < t.expiresAt,
    }));
  }
}
