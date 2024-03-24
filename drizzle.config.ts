import type { Config } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing')
}

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  driver: 'libsql',
} satisfies Config
