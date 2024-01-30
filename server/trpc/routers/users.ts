import { z } from 'zod'
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  adminOnlyProcedure,
} from '../trpc'
import { TRPCError } from '@trpc/server'
import { count, eq } from 'drizzle-orm'
import { user } from '~/drizzle/schema'
/* eslint-enable @typescript-eslint/no-unused-vars */
export const usersRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.user.findMany({
        orderBy: (user, { desc }) => [desc(user.id)],
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
  getUserEntries: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, input),
        with: { entries: { with: { event: true } } },
      })
    }),
  updateUserRole: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
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
  getUser: adminProcedure.input(z.number()).query(async ({ ctx, input }) => {
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
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, ctx.session.user.id),
      with: {
        accounts: true,
        entries: {
          orderBy: (entry, { desc }) => [desc(entry.createdAt)],
          with: {
            event: true,
          },
        },
      },
    })
  }),
  getUserValid: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const num = await ctx.db
        .select({ value: count() })
        .from(user)
        .where(eq(user.name, input))
      return num[0].value
    }),
  updateUser: adminProcedure
    .input(
      z.object({ id: z.number(), name: z.string().max(191), image: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user).set(input).where(eq(user.id, input.id))
      return ctx.db.query.user.findFirst({ where: eq(user.id, input.id) })
    }),
  updateSessionUser: protectedProcedure
    .input(z.object({ name: z.string().max(191), image: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set(input)
        .where(eq(user.id, ctx.session.user.id))
      return ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.session.user.id),
      })
    }),
})
