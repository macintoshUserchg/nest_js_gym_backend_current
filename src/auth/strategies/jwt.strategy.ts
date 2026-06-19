import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtconfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtconfiguration.secret || process.env.JWT_SECRET || '',
    });
  }

  async validate(payload: AuthJwtPayload) {
    // The token proves identity; load the user from the DB so the request
    // always carries the caller's current tenant (gym/branch). This is what
    // tenant guards (e.g. BranchAccessGuard) compare against.
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User account not found');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      gymId: user.gym?.gymId,
      branchId: user.branch?.branchId,
    };
  }
}
