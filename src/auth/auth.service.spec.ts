import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PasswordResetToken } from '../entities/password_reset_tokens.entity';
import { RefreshToken } from '../entities/refresh_tokens.entity';
import { Role } from '../entities/roles.entity';
import { User } from '../entities/users.entity';

// Salt rounds kept low to keep the suite fast; the service hardcodes 10.
const HASH_ROUNDS = 4;

jest.mock('twilio', () => {
  return jest.fn(() => ({
    verify: {
      v2: {
        services: () => ({
          verifications: { create: jest.fn() },
          verificationChecks: { create: jest.fn() },
        }),
      },
    },
  }));
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let emailService: jest.Mocked<
    Pick<EmailService, 'sendPasswordReset' | 'sendWelcomeEmail'>
  >;
  let resetTokenRepo: Record<string, jest.Mock>;
  let refreshTokenRepo: Record<string, jest.Mock>;
  let roleRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;

  const PASSWORD = 'Sup3rSecret!';

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findOtpEligibleUserByPhone: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    emailService = {
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    // Identity mocks: the TypeORM .create() / .save() helpers echo back what
    // they are given. Typed via <T> so the mock return is not `any`.
    const identity = <T>(value: T): T => value;

    resetTokenRepo = {
      create: jest.fn(identity),
      save: jest.fn(identity),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    refreshTokenRepo = {
      create: jest.fn(identity),
      save: jest.fn(identity),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
    };
    roleRepo = { findOne: jest.fn() };
    userRepo = {
      create: jest.fn(identity),
      save: jest.fn(identity),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: EmailService, useValue: emailService },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: resetTokenRepo,
        },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepo,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('validateUser', () => {
    it('returns the user (minus passwordHash) on correct credentials', async () => {
      const passwordHash = await bcrypt.hash(PASSWORD, HASH_ROUNDS);
      usersService.findByEmail.mockResolvedValue({
        userId: 'u1',
        email: 'a@b.com',
        passwordHash,
        role: { name: 'MEMBER' },
      } as never);

      const result = await service.validateUser('a@b.com', PASSWORD);

      expect(result).toMatchObject({ userId: 'u1', email: 'a@b.com' });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException when the user is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null as never);
      await expect(service.validateUser('x@y.com', PASSWORD)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException on a wrong password', async () => {
      const passwordHash = await bcrypt.hash(PASSWORD, HASH_ROUNDS);
      usersService.findByEmail.mockResolvedValue({
        userId: 'u1',
        email: 'a@b.com',
        passwordHash,
        role: { name: 'MEMBER' },
      } as never);

      await expect(service.validateUser('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when the account has no password set', async () => {
      usersService.findByEmail.mockResolvedValue({
        userId: 'u1',
        email: 'a@b.com',
        role: { name: 'MEMBER' },
      } as never);

      await expect(service.validateUser('a@b.com', PASSWORD)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('signs a JWT carrying sub, email and role', () => {
      const token = service.login({
        userId: 'u1',
        email: 'a@b.com',
        role: { name: 'ADMIN' },
      });

      expect(token).toBe('signed.jwt.token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'a@b.com',
        role: 'ADMIN',
      });
    });
  });

  describe('register', () => {
    const memberRole = { name: 'MEMBER' } as Role;

    it('creates a member, sends a welcome email and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue(null as never);
      roleRepo.findOne.mockResolvedValue(memberRole);
      userRepo.save.mockResolvedValue({
        userId: 'new-1',
        email: 'new@b.com',
        role: memberRole,
      } as never);

      const result = await service.register('new@b.com', PASSWORD);

      expect(result.user).toMatchObject({ userId: 'new-1' });
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.access_token).toBe('signed.jwt.token');
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'new-1',
        email: 'new@b.com',
        role: 'MEMBER',
      });
    });

    it('rejects a duplicate email with BadRequestException', async () => {
      usersService.findByEmail.mockResolvedValue({
        userId: 'u1',
        email: 'dup@b.com',
      } as never);

      await expect(service.register('dup@b.com', PASSWORD)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('rejects when the MEMBER role is missing', async () => {
      usersService.findByEmail.mockResolvedValue(null as never);
      roleRepo.findOne.mockResolvedValue(null);

      await expect(service.register('x@b.com', PASSWORD)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    const okResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    it('returns the same success response for an unknown email (enumeration-safe) and sends nothing', async () => {
      usersService.findByEmail.mockResolvedValue(null as never);

      const result = await service.forgotPassword('ghost@b.com');

      expect(result).toEqual(okResponse);
      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(resetTokenRepo.save).not.toHaveBeenCalled();
    });

    it('invalidates existing tokens, stores a new one and emails the link for a known user', async () => {
      usersService.findByEmail.mockResolvedValue({
        userId: 'u1',
        email: 'real@b.com',
      } as never);

      const result = await service.forgotPassword('real@b.com');

      expect(result).toEqual(okResponse);
      expect(resetTokenRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ user: { userId: 'u1' }, used: false }),
        { used: true },
      );
      expect(resetTokenRepo.save).toHaveBeenCalledTimes(1);
      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(
        'real@b.com',
        expect.stringContaining('/reset-password?token='),
      );
    });
  });

  describe('resetPassword', () => {
    function validTokenRow(overrides: Partial<PasswordResetToken> = {}) {
      const future = new Date(Date.now() + 60_000);
      return {
        token: 'abc',
        used: false,
        expiresAt: future,
        user: { userId: 'u1' },
        ...overrides,
      } as PasswordResetToken;
    }

    it('throws BadRequestException for an unknown / already-used token', async () => {
      resetTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('nope', 'NewPass!1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('marks an expired token as used and rejects', async () => {
      const expired = validTokenRow({
        expiresAt: new Date(Date.now() - 60_000),
      });
      resetTokenRepo.findOne.mockResolvedValue(expired);

      await expect(service.resetPassword('abc', 'NewPass!1')).rejects.toThrow(
        BadRequestException,
      );
      expect(expired.used).toBe(true);
      expect(resetTokenRepo.save).toHaveBeenCalledWith(expired);
    });

    it('hashes a new password, updates the user and consumes the token', async () => {
      const row = validTokenRow();
      resetTokenRepo.findOne.mockResolvedValue(row);

      await service.resetPassword('abc', 'NewPass!1');

      expect(usersService.update).toHaveBeenCalledWith(
        'u1',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
      expect(row.used).toBe(true);
      expect(resetTokenRepo.save).toHaveBeenCalledWith(row);
    });
  });

  describe('generateRefreshToken / refreshAccessToken', () => {
    it('errors when the refresh token does not exist', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.refreshAccessToken('missing')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('errors when the refresh token is revoked', async () => {
      refreshTokenRepo.findOne.mockResolvedValue({
        token: 't',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 60_000),
        user: { userId: 'u1', email: 'a@b.com', role: { name: 'MEMBER' } },
      } as RefreshToken);

      await expect(service.refreshAccessToken('t')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('revokes and rejects an expired refresh token', async () => {
      const expired = {
        token: 't',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 60_000),
        user: { userId: 'u1', email: 'a@b.com', role: { name: 'MEMBER' } },
      } as RefreshToken;
      refreshTokenRepo.findOne.mockResolvedValue(expired);

      await expect(service.refreshAccessToken('t')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(expired.isRevoked).toBe(true);
    });

    it('rotates: revokes the old token, issues a new pair', async () => {
      const oldToken = {
        token: 'old',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 60_000),
        user: { userId: 'u1', email: 'a@b.com', role: { name: 'MEMBER' } },
      } as RefreshToken;
      refreshTokenRepo.findOne.mockResolvedValue(oldToken);

      const result = await service.refreshAccessToken('old');

      expect(oldToken.isRevoked).toBe(true);
      expect(oldToken.replacedByToken).toBe(result.refresh_token);
      expect(result.access_token).toBe('signed.jwt.token');
      expect(result.refresh_token).toEqual(expect.any(String));
      // new token persisted + old token persisted after revocation
      expect(refreshTokenRepo.save).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'a@b.com',
        role: 'MEMBER',
      });
    });
  });

  describe('revokeRefreshToken', () => {
    it('throws BadRequestException for an unknown token', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.revokeRefreshToken('nope')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('marks a known token as revoked', async () => {
      const token = { token: 't', isRevoked: false } as RefreshToken;
      refreshTokenRepo.findOne.mockResolvedValue(token);

      const result = await service.revokeRefreshToken('t');

      expect(token.isRevoked).toBe(true);
      expect(result).toEqual({ message: 'Token revoked successfully' });
    });
  });

  describe('OTP (Twilio not configured)', () => {
    it('throws ServiceUnavailable when an eligible user exists but Twilio is not configured', async () => {
      // An OTP-eligible user is found first; only then does the guard try to
      // use the Twilio client, which is null in this environment.
      usersService.findOtpEligibleUserByPhone.mockResolvedValue({
        userId: 'u1',
        email: 'a@b.com',
        role: { name: 'MEMBER' },
      } as never);

      await expect(service.requestMobileOtp('+15555550100')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
