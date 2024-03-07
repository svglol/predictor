import { drizzle as drizzleD1, DrizzleD1Database } from 'drizzle-orm/d1'
import { createClient as createLibSQLClient } from '@libsql/client/http'
import { createClient as createLibSQLClientLocal } from '@libsql/client'
import { drizzle as drizzleLibSQL, LibSQLDatabase } from 'drizzle-orm/libsql'
import { join } from 'pathe'
import * as schema from '~/server/database/schema'

export * as tables from '~/server/database/schema'

let _db:
  | LibSQLDatabase<typeof schema>
  | DrizzleD1Database<typeof schema>
  | null = null

export const useDB = () => {
  if (!_db) {
    if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
      // Turso in production
      _db = drizzleLibSQL(
        createLibSQLClient({
          url: process.env.TURSO_DB_URL,
          authToken: process.env.TURSO_DB_TOKEN,
        }),
        { schema }
      )
    } else if (process.env.DB) {
      // d1 in production
      _db = drizzleD1(process.env.DB, { schema })
    } else if (process.dev) {
      // local sqlite in development
      _db = drizzleLibSQL(
        createLibSQLClientLocal({
          url: 'file:' + join(process.cwd(), '.data/db.sqlite'),
          authToken: '...',
        }),
        { schema }
      )
    } else {
      throw new Error('No database configured for production')
    }
  }
  return _db
}

export function isTuple<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0
}
