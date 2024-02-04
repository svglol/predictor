import { z } from 'zod'
import { count, eq } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { user } from '~/drizzle/schema'

export const usersRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(({ ctx }) => {
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
  getUser: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.user.findFirst({
      where: eq(user.name, input),
      columns: {
        name: true,
        image: true,
      },
      with: {
        entries: { with: { event: true } },
      },
    })
  }),
})
