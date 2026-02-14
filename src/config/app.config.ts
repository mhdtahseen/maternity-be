import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'ai-multi-user-maternity-journal',
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  throttleTtl: Number(process.env.THROTTLE_TTL ?? 60),
  throttleLimit: Number(process.env.THROTTLE_LIMIT ?? 120)
}));
