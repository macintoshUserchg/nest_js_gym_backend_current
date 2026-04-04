import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RequestMobileOtpDto } from './dto/request-mobile-otp.dto';
import { VerifyMobileOtpDto } from './dto/verify-mobile-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { FeatureFlagGuard } from '../common/guards/feature-flag.guard';
import { FeatureFlag } from '../common/decorators/feature-flag.decorator';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns JWT token for subsequent API calls.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: LoginResponseDto,
    examples: {
      success: {
        summary: 'Successful login response',
        value: {
          userid: 'usr_1234567890abcdef',
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMTIzNDU2Nzg5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE2MzM4MzA2MDAsImV4cCI6MTYzMzgzNDIwMH0.example_signature',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
    examples: {
      invalidCredentials: {
        summary: 'Invalid login credentials',
        value: {
          statusCode: 401,
          message: 'Invalid email or password',
          error: 'Unauthorized',
        },
      },
    },
  })
  @ApiBody({
    type: LoginUserDto,
    examples: {
      valid: {
        value: {
          email: 'member@example.com',
          password: 'SecurePassword123!',
        },
      },
    },
  })
  async login(
    @Body() loginDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<any> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.login(user);
    const enableRefreshTokens = this.configService.get<boolean>(
      'featureFlags.enableRefreshTokens',
    );

    if (enableRefreshTokens) {
      const refreshToken = await this.authService.generateRefreshToken(
        user,
        req.ip,
        req.headers['user-agent'],
      );
      return {
        userid: user.userId,
        access_token: token,
        refresh_token: refreshToken,
      };
    }

    return {
      userid: user.userId,
      access_token: token,
    };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      "Sends a password reset token to the user's email. Always returns success to prevent email enumeration.",
  })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent (if account exists).',
    schema: {
      properties: {
        message: {
          type: 'string',
          example:
            'If an account with that email exists, a password reset link has been sent.',
        },
      },
    },
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      valid: {
        value: { email: 'user@example.com' },
      },
    },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Resets the user password using a valid reset token. Token expires after 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password has been reset successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token.',
    examples: {
      invalidToken: {
        summary: 'Invalid or expired token',
        value: {
          statusCode: 400,
          message: 'Invalid or expired reset token',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      valid: {
        value: {
          token: 'a1b2c3d4e5f6789012345678901234567890abcdef',
          newPassword: 'NewSecurePass123!',
        },
      },
    },
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('otp/mobile/request')
  @ApiOperation({
    summary: 'Send mobile OTP',
    description:
      'Sends a Twilio Verify OTP to an eligible member or trainer mobile number.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
    schema: {
      properties: {
        message: { type: 'string', example: 'OTP sent successfully' },
        phoneNumber: { type: 'string', example: '+919876543210' },
      },
    },
  })
  requestMobileOtp(@Body() body: RequestMobileOtpDto) {
    return this.authService.requestMobileOtp(body.phoneNumber);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('otp/mobile/verify')
  @ApiOperation({
    summary: 'Verify mobile OTP',
    description:
      'Verifies the submitted Twilio OTP and returns a JWT token for eligible member and trainer accounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully.',
    type: LoginResponseDto,
  })
  verifyMobileOtp(@Body() body: VerifyMobileOtpDto): Promise<LoginResponseDto> {
    return this.authService.verifyMobileOtp(body.phoneNumber, body.code);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(FeatureFlagGuard)
  @FeatureFlag('enableRegistration')
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email verification. Feature flag controlled.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists or invalid data.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.phoneNumber);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(FeatureFlagGuard)
  @FeatureFlag('enableEmailVerification')
  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies the user email using the token sent via email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logout user and invalidate JWT token. Client should discard the token after successful logout.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
    examples: {
      success: {
        summary: 'Successful logout',
        value: {
          message: 'Logged out successfully. Please discard your token.',
        },
      },
    },
  })
  async logout() {
    return { message: 'Logged out successfully. Please discard your token.' };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(FeatureFlagGuard)
  @FeatureFlag('enableRefreshTokens')
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Uses a refresh token to get a new access/refresh token pair.',
  })
  @ApiBody({
    schema: {
      properties: {
        refresh_token: { type: 'string', example: 'abc123...' },
      },
    },
  })
  async refresh(@Body() body: { refresh_token: string }, @Req() req: Request) {
    return this.authService.refreshAccessToken(
      body.refresh_token,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiOperation({
    summary: 'Get active sessions',
    description: 'Returns all active sessions for the current user.',
  })
  async getSessions(@CurrentUser() user: User) {
    return this.authService.getActiveSessions(user.userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke')
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Revokes all active sessions for the current user.',
  })
  @ApiBody({
    schema: {
      properties: {
        tokenId: {
          type: 'string',
          description: 'Optional: revoke specific token only',
        },
      },
    },
  })
  async revokeSessions(
    @CurrentUser() user: User,
    @Body() body?: { tokenId?: string },
  ) {
    if (body?.tokenId) {
      return this.authService.revokeRefreshToken(body.tokenId);
    }
    return this.authService.revokeAllUserTokens(user.userId);
  }
}
