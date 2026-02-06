import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
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
}
