import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { migrate as migrateLibSQL } from 'drizzle-orm/libsql/migrator'

export default defineNitroPlugin(async () => {
  if (!import.meta.dev)
    return
  if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
    await migrateLibSQL(
      useDB(),
      {
        migrationsFolder: './server/database/migrations',
      },
    )
  }
  else if (process.dev) {
    migrateLibSQL(
      useDB(),
      {
        migrationsFolder: './server/database/migrations',
      },
    )
  }
})
