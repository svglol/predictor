import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'turso',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
})
