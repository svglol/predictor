import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient as createLibSQLClientLocal } from '@libsql/client'
import { createClient as createLibSQLClient } from '@libsql/client/http'
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql'
import { join } from 'pathe'
import * as schema from '~/server/database/schema'

export { and, eq, like, or, sql } from 'drizzle-orm'
export * as tables from '~/server/database/schema'
let _db:
  | LibSQLDatabase<typeof schema>
  | null = null

export function useDB() {
  if (!_db) {
    if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
      // Turso in production
      _db = drizzleLibSQL(
        createLibSQLClient({
          url: process.env.TURSO_DB_URL,
          authToken: process.env.TURSO_DB_TOKEN,
        }),
        { schema },
      )
    }
    else if (process.dev) {
      // local sqlite in development
      _db = drizzleLibSQL(
        createLibSQLClientLocal({
          url: `file:${join(process.cwd(), '.data/db.sqlite')}`,
          authToken: '...',
        }),
        { schema },
      )
    }
    else {
      throw new Error('No database configured for production')
    }
  }
  return _db
}
