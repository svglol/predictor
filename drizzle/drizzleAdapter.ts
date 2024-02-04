import { and, count, eq } from 'drizzle-orm'

import type { Adapter } from '@auth/core/adapters'
import type { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'
import * as schema from './schema'

import {
  user as users,
  account as accounts,
  session as sessions,
  verificationToken as verificationTokens,
} from '~/drizzle/schema'

export function mySqlDrizzleAdapter(
  client: PlanetScaleDatabase<typeof schema>
): Adapter {
  return {
    // @ts-ignore
    async createUser(data) {
      const id = crypto.randomUUID()

      if (data.emailVerified) {
        const numUsers = await client
          .select({ value: count(users.id) })
          .from(users)
          .where(and(eq(users.name, data.email.split('@')[0])))
        if (numUsers[0].value === 0) {
          data.name = data.email.split('@')[0]
        } else {
          data.name = `${data.email.split('@')[0]}${numUsers[0].value}`
        }
        data.image = `https://api.dicebear.com/6.x/bottts/svg?seed=${data.email}`
      }
      await client.insert(users).values({ ...data, id })

      return await client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, id),
      })
    },
    // @ts-ignore
    getUser(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, data),
      })
    },
    // @ts-ignore
    getUserByEmail(data) {
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.email, data),
      })
    },
    // @ts-ignore
    async createSession(data) {
      await client.insert(sessions).values({
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      })

      return await client
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    // @ts-ignore
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
    // @ts-ignore
    async updateUser(data) {
      if (!data.id) {
        throw new Error('No user id.')
      }

      await client
        .update(users)
        .set({
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
          role: data.role,
        })
        .where(eq(users.id, data.id))

      return await client
        .select()
        .from(users)
        .where(eq(users.id, data.id))
        .then(res => res[0])
    },
    // @ts-ignore
    async updateSession(data) {
      await client
        .update(sessions)
        .set({
          expires: data.expires,
          sessionToken: data.sessionToken,
          userId: data.userId,
        })
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
    // @ts-ignore
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
      return dbAccount.User
    },
    // @ts-ignore
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
    // @ts-ignore
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
