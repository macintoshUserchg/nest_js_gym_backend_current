import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FEATURE_FLAG_KEY } from '../decorators/feature-flag.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = this.reflector.get<string>(
      FEATURE_FLAG_KEY,
      context.getHandler(),
    );

    if (!flag) {
      return true;
    }

    const isEnabled = this.configService.get<boolean>(`featureFlags.${flag}`);

    if (!isEnabled) {
      throw new ServiceUnavailableException(
        `Feature "${flag}" is currently disabled`,
      );
    }

    return true;
  }
}
