import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitizeObject } from '../utils/sanitize.util';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (request.body && typeof request.body === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.body = sanitizeObject(request.body);
    }
    return next.handle();
  }
}
