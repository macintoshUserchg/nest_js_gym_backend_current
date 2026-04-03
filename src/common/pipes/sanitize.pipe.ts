import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitizeObject } from '../utils/sanitize.util';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value && typeof value === 'object') {
      return sanitizeObject(value);
    }
    return value;
  }
}
