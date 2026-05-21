const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(10),
  REDIS_URL: z.string().min(5),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(14).default(12),
  EMAIL_FROM: z.string().default('LeanStock <no-reply@leanstock.local>'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  AUTH_RATE_LIMIT_PER_MINUTE: z.coerce.number().default(5),
  PUBLIC_RATE_LIMIT_PER_MINUTE: z.coerce.number().default(80),
  RESERVATION_TTL_SECONDS: z.coerce.number().default(600),
  DEAD_STOCK_DAYS: z.coerce.number().default(30),
  DEAD_STOCK_DECAY_PERCENT: z.coerce.number().default(10),
  DEAD_STOCK_DECAY_INTERVAL_HOURS: z.coerce.number().default(72)
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
