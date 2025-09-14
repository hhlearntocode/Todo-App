import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
});

export type Env = z.infer<typeof envSchema>;
