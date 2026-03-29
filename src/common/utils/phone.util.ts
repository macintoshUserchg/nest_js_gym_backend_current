import { BadRequestException } from '@nestjs/common';

export function normalizePhoneNumber(rawPhone: string): string {
  const sanitized = rawPhone.replace(/[^\d+]/g, '');

  if (!sanitized) {
    throw new BadRequestException('Phone number is required');
  }

  if (sanitized.startsWith('+')) {
    if (!/^\+[1-9]\d{7,14}$/.test(sanitized)) {
      throw new BadRequestException('Phone number must be a valid E.164 value');
    }
    return sanitized;
  }

  const digitsOnly = sanitized.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  throw new BadRequestException('Phone number must be a valid E.164 value');
}
