import { z } from 'zod'
import { and, count, eq } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { user, notification } from '~/drizzle/schema'

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
        id: true,
        name: true,
        image: true,
      },
      with: {
        entries: { with: { event: true } },
      },
    })
  }),
  getNotifications: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.notification.findMany({
      where: and(
        eq(notification.userId, ctx.session.user.id),
        eq(notification.read, false)
      ),
    })
  }),
  markAllNotificationsAsRead: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, ctx.session.user.id))
  }),
  markNotificationAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.id, input),
            eq(notification.userId, ctx.session.user.id)
          )
        )
      return ctx.db.query.notification.findMany({
        where: and(
          eq(notification.userId, ctx.session.user.id),
          eq(notification.read, false)
        ),
      })
    }),
  markEventNotificationsAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.eventId, input),
            eq(notification.userId, ctx.session.user.id)
          )
        )
      return ctx.db.query.notification.findMany({
        where: and(
          eq(notification.userId, ctx.session.user.id),
          eq(notification.read, false)
        ),
      })
    }),
})
