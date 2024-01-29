import { and, eq } from 'drizzle-orm'
import {
  int,
  mysqlTable as defaultMySqlTableFn,
  primaryKey,
  varchar,
  MySqlDatabase,
  datetime,
  longtext,
  text,
} from 'drizzle-orm/mysql-core'
import type { MySqlTableFn } from 'drizzle-orm/mysql-core'
import type { Adapter, AdapterAccount } from '@auth/core/adapters'
import * as schema from '../drizzle/schema'
import type { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'

export function createTables(mySqlTable: MySqlTableFn) {
  const users = mySqlTable('User', {
    id: int('id').autoincrement().notNull(),
    name: varchar('name', { length: 191 }),
    email: varchar('email', { length: 191 }),
    emailVerified: datetime('emailVerified', { mode: 'date', fsp: 3 }),
    image: longtext('image'),
    role: varchar('role', { length: 191 }).default('USER').notNull(),
  })

  const accounts = mySqlTable(
    'Account',
    {
      id: int('id').autoincrement().notNull(),
      userId: int('userId').notNull(),
      type: varchar('type', { length: 191 })
        .notNull()
        .$type<AdapterAccount['type']>(),
      provider: varchar('provider', { length: 191 }).notNull(),
      providerAccountId: varchar('providerAccountId', {
        length: 191,
      }).notNull(),
      refreshToken: text('refresh_token'),
      accessToken: text('access_token'),
      expiresAt: int('expires_at'),
      tokenType: varchar('token_type', { length: 191 }),
      scope: varchar('scope', { length: 191 }),
      idToken: text('id_token'),
      sessionState: varchar('session_state', { length: 191 }),
    },
    account => ({
      compoundKey: primaryKey(account.provider, account.providerAccountId),
    })
  )

  const sessions = mySqlTable('Session', {
    id: int('id').autoincrement().notNull(),
    sessionToken: varchar('sessionToken', { length: 191 }).notNull(),
    userId: int('userId').notNull(),
    expires: datetime('expires', { mode: 'string', fsp: 3 }).notNull(),
  })

  const verificationTokens = mySqlTable(
    'VerificationToken',
    {
      identifier: varchar('identifier', { length: 191 }).notNull(),
      token: varchar('token', { length: 191 }).notNull(),
      expires: datetime('expires', { mode: 'date', fsp: 3 }).notNull(),
    },
    vt => ({
      compoundKey: primaryKey(vt.identifier, vt.token),
    })
  )

  return { users, accounts, sessions, verificationTokens }
}

export type DefaultSchema = ReturnType<typeof createTables>

export function mySqlDrizzleAdapter(
  client: PlanetScaleDatabase<typeof schema>,
  tableFn = defaultMySqlTableFn
): Adapter {
  const { users, accounts, sessions, verificationTokens } =
    createTables(tableFn)
  return {
    async createUser(data) {
      const createdUser = await client.insert(users).values(data)

      return await client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, Number(createdUser.insertId)),
      })
      //   return await client
      //     .select()
      //     .from(users)
      //     .where(eq(users.id, Number(user.insertId)))
      //     .then(res => res[0])
    },
    async getUser(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, Number(data)),
      })
      //   const thing =
      //     (await client
      //       .select()
      //       .from(users)
      //       .where(eq(users.id, data))
      //       .then(res => res[0])) ?? null

      //   return thing
    },
    async getUserByEmail(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.email, data),
      })
      //   const user =
      //     (await client
      //       .select()
      //       .from(users)
      //       .where(eq(users.email, data))
      //       .then(res => res[0])) ?? null

      //   return user
    },
    async createSession(data) {
      await client.insert(sessions).values(data)

      return await client
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    async getSessionAndUser(data) {
      const sessionAndUser =
        (await client
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, data))
          .innerJoin(users, eq(users.id, sessions.userId))
          .then(res => res[0])) ?? null

      return sessionAndUser
    },
    async updateUser(data) {
      if (!data.id) {
        throw new Error('No user id.')
      }

      await client.update(users).set(data).where(eq(users.id, data.id))

      return await client
        .select()
        .from(users)
        .where(eq(users.id, data.id))
        .then(res => res[0])
    },
    async updateSession(data) {
      await client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))

      return await client
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    async linkAccount(rawAccount) {
      await client.insert(accounts).values(rawAccount)
    },
    async getUserByAccount(account) {
      const dbAccount =
        (await client
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.providerAccountId, account.providerAccountId),
              eq(accounts.provider, account.provider)
            )
          )
          .leftJoin(users, eq(accounts.userId, users.id))
          .then(res => res[0])) ?? null

      if (!dbAccount) {
        return null
      }

      return dbAccount.user
    },
    async deleteSession(sessionToken) {
      const session =
        (await client
          .select()
          .from(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .then(res => res[0])) ?? null

      await client
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken))

      return session
    },
    async createVerificationToken(token) {
      await client.insert(verificationTokens).values(token)

      return await client
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.identifier, token.identifier))
        .then(res => res[0])
    },
    async useVerificationToken(token) {
      try {
        const deletedToken =
          (await client
            .select()
            .from(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token)
              )
            )
            .then(res => res[0])) ?? null

        await client
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token)
            )
          )

        return deletedToken
      } catch (err) {
        throw new Error('No verification token found.')
      }
    },
    async deleteUser(id) {
      const user = await client
        .select()
        .from(users)
        .where(eq(users.id, id))
        .then(res => res[0] ?? null)

      await client.delete(users).where(eq(users.id, id))

      return user
    },
    async unlinkAccount(account) {
      await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        )

      return undefined
    },
  }
}
