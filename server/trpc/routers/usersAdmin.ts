import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { count, eq } from 'drizzle-orm'
import { createTRPCRouter, adminProcedure, adminOnlyProcedure } from '../trpc'
import { user } from '~/server/db/schema'

export const usersAdminRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.user.findMany({
        orderBy: (user, { asc }) => [asc(user.name)],
        limit: input.perPage,
        offset: (input.page - 1) * input.perPage,
        with: {
          accounts: true,
        },
      })
    }),
  getUserCount: adminProcedure.query(async ({ ctx }) => {
    const num = await ctx.db.select({ value: count() }).from(user)
    return num[0].value
  }),
  updateUserRole: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userToUpdate = await ctx.db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, input.id),
        with: { accounts: true },
      })
      if (
        userToUpdate?.accounts.filter(
          account =>
            account.providerAccountId === process.env.DISCORD_ADMIN_USER_ID
        )
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is global admin',
        })
      } else {
        await ctx.db
          .update(user)
          .set({ role: input.role })
          .where(eq(user.id, input.id))

        return ctx.db.query.user.findFirst({
          where: (user, { eq }) => eq(user.id, input.id),
        })
      }
    }),
  getUser: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, input),
      with: {
        accounts: true,
        entries: {
          with: {
            event: true,
          },
        },
      },
    })
  }),
  updateUser: adminProcedure
    .input(
      z.object({ id: z.string(), name: z.string().max(191), image: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user).set(input).where(eq(user.id, input.id))
      return ctx.db.query.user.findFirst({ where: eq(user.id, input.id) })
    }),
})
