import { and, count, eq } from 'drizzle-orm'

import type { Adapter } from '@auth/core/adapters'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from './schema'

export function mySqlDrizzleAdapter(
  client: LibSQLDatabase<typeof schema> | DrizzleD1Database<typeof schema>,
): Adapter {
  return {
    // @ts-expect-error type error
    async createUser(data) {
      const id = crypto.randomUUID()

      if (!data.name && data.email) {
        const users = await client
          .select()
          .from(tables.user)
          .where(and(eq(tables.user.name, data.email.split('@')[0])))

        const numUsers = users.length
        if (numUsers === 0)
          data.name = data.email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, '')

        else
          data.name = `${data.email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, '')}${numUsers}`
      }
      if (!data.image && data.name)
        data.image = `https://api.dicebear.com/6.x/bottts/svg?seed=${data.name}`

      await client
        .insert(tables.user)
        .values({ ...data, id, name: data.name, image: data.image })

      return await client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, id),
      })
    },
    // @ts-expect-error type error
    getUser(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, data),
      })
    },
    // @ts-expect-error type error
    getUserByEmail(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.email, data),
      })
    },
    async createSession(data) {
      await client.insert(tables.session).values({
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      })

      return await client
        .select()
        .from(tables.session)
        .where(eq(tables.session.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    // @ts-expect-error type error
    async getSessionAndUser(data) {
      const sessionAndUser
        = (await client
        // @ts-expect-error type error
          .select({
            session: tables.session,
            user: tables.user,
          })
          .from(tables.session)
          .where(eq(tables.session.sessionToken, data))
          .innerJoin(tables.user, eq(tables.user.id, tables.session.userId))
          .then(res => res[0])) ?? null

      return sessionAndUser
    },
    // @ts-expect-error type error
    async updateUser(data) {
      if (!data.id)
        throw new Error('No user id.')

      await client
        .update(tables.user)
        .set({
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
          role: data.role,
        })
        .where(eq(tables.user.id, data.id))

      return await client
        .select()
        .from(tables.user)
        .where(eq(tables.user.id, data.id))
        .then(res => res[0])
    },
    async updateSession(data) {
      await client
        .update(tables.session)
        .set({
          expires: data.expires,
          sessionToken: data.sessionToken,
          userId: data.userId,
        })
        .where(eq(tables.session.sessionToken, data.sessionToken))

      return await client
        .select()
        .from(tables.session)
        .where(eq(tables.session.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    async linkAccount(rawAccount) {
      await client.insert(tables.account).values(rawAccount)
    },
    // @ts-expect-error type error
    async getUserByAccount(account) {
      const dbAccount
        = (await client
          .select()
          .from(tables.account)
          .where(
            and(
              eq(tables.account.providerAccountId, account.providerAccountId),
              eq(tables.account.provider, account.provider),
            ),
          )
          .leftJoin(tables.user, eq(tables.account.userId, tables.user.id))
          .then(res => res[0])) ?? null

      if (!dbAccount)
        return null

      return dbAccount.User
    },
    async deleteSession(sessionToken) {
      const session
        = (await client
          .select()
          .from(tables.session)
          .where(eq(tables.session.sessionToken, sessionToken))
          .then(res => res[0])) ?? null

      await client
        .delete(tables.session)
        .where(eq(tables.session.sessionToken, sessionToken))

      return session
    },
    async createVerificationToken(token) {
      await client.insert(tables.verificationToken).values(token)

      return await client
        .select()
        .from(tables.verificationToken)
        .where(eq(tables.verificationToken.identifier, token.identifier))
        .then(res => res[0])
    },
    async useVerificationToken(token) {
      try {
        const deletedToken
          = (await client
            .select()
            .from(tables.verificationToken)
            .where(
              and(
                eq(tables.verificationToken.identifier, token.identifier),
                eq(tables.verificationToken.token, token.token),
              ),
            )
            .then(res => res[0])) ?? null

        await client
          .delete(tables.verificationToken)
          .where(
            and(
              eq(tables.verificationToken.identifier, token.identifier),
              eq(tables.verificationToken.token, token.token),
            ),
          )

        return deletedToken
      }
      catch (err) {
        throw new Error('No verification token found.')
      }
    },
    // @ts-expect-error type error
    async deleteUser(id) {
      const user = await client
        .select()
        .from(tables.user)
        .where(eq(tables.user.id, id))
        .then(res => res[0] ?? null)

      await client.delete(tables.user).where(eq(tables.user.id, id))

      return user
    },
    async unlinkAccount(account) {
      await client
        .delete(tables.account)
        .where(
          and(
            eq(tables.account.providerAccountId, account.providerAccountId),
            eq(tables.account.provider, account.provider),
          ),
        )

      return undefined
    },
  }
}
