import { and, eq } from 'drizzle-orm'

import type { Adapter } from '@auth/core/adapters'
import * as schema from './schema'
import type { PlanetScaleDatabase } from 'drizzle-orm/planetscale-serverless'

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
    async createUser(data) {
      console.log('createUser', data)
      const createdUser = await client.insert(users).values(data)

      return await client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, Number(createdUser.insertId)),
      })
    },
    async getUser(data) {
      console.log('getUser', data)
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, Number(data)),
      })
    },
    async getUserByEmail(data) {
      console.log('getUserByEmail', data)
      return client.query.user.findFirst({
        where: (user, { eq }) => eq(user.email, data),
      })
    },
    async createSession(data) {
      console.log('createSession', data)
      await client.insert(sessions).values(data)

      return await client
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then(res => res[0])
    },
    async getSessionAndUser(data) {
      console.log('getSessionAndUser', data)
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
      console.log('updateUser', data)
      if (!data.id) {
        throw new Error('No user id.')
      }

      await client
        .update(users)
        .set(data)
        .where(eq(users.id, Number(data.id)))

      return await client
        .select()
        .from(users)
        .where(eq(users.id, Number(data.id)))
        .then(res => res[0])
    },
    async updateSession(data) {
      console.log('updateSession', data)
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
      console.log('linkAccount', rawAccount)
      await client.insert(accounts).values(rawAccount)
    },
    async getUserByAccount(account) {
      console.log('getUserByAccount', account)
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
    async deleteSession(sessionToken) {
      console.log('deleteSession', sessionToken)
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
      console.log('createVerificationToken', token)
      await client.insert(verificationTokens).values(token)

      return await client
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.identifier, token.identifier))
        .then(res => res[0])
    },
    async useVerificationToken(token) {
      console.log('useVerificationToken', token)
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
      console.log('deleteUser', id)
      const user = await client
        .select()
        .from(users)
        .where(eq(users.id, Number(id)))
        .then(res => res[0] ?? null)

      await client.delete(users).where(eq(users.id, Number(id)))

      return user
    },
    async unlinkAccount(account) {
      console.log('unlinkAccount', account)
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
