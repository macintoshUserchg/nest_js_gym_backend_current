import { SetMetadata } from '@nestjs/common';

export const SKIP_SANITIZE_KEY = 'skip-sanitize';

export const SkipSanitize = () => SetMetadata(SKIP_SANITIZE_KEY, true);
