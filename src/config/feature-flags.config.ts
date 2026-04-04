import { registerAs } from '@nestjs/config';

export interface FeatureFlagsConfig {
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  enableRefreshTokens: boolean;
  enableBookingSystem: boolean;
  enablePaymentGateway: boolean;
  enableWebSocket: boolean;
  enableSoftDelete: boolean;
}

const featureFlagsConfig = registerAs(
  'featureFlags',
  (): FeatureFlagsConfig => ({
    enableRegistration: process.env.FEATURE_ENABLE_REGISTRATION === 'true',
    enableEmailVerification:
      process.env.FEATURE_ENABLE_EMAIL_VERIFICATION === 'true',
    enableRefreshTokens: process.env.FEATURE_ENABLE_REFRESH_TOKENS === 'true',
    enableBookingSystem: process.env.FEATURE_ENABLE_BOOKING_SYSTEM === 'true',
    enablePaymentGateway: process.env.FEATURE_ENABLE_PAYMENT_GATEWAY === 'true',
    enableWebSocket: process.env.FEATURE_ENABLE_WEBSOCKET === 'true',
    enableSoftDelete: process.env.FEATURE_ENABLE_SOFT_DELETE === 'true',
  }),
);

export default featureFlagsConfig;
export { featureFlagsConfig };
