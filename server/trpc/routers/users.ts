import { z } from 'zod'
import { and, count, eq } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

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
        .from(tables.user)
        .where(eq(tables.user.name, input))
      return num[0].value
    }),
  updateSessionUser: protectedProcedure
    .input(z.object({ name: z.string().max(191), image: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tables.user)
        .set(input)
        .where(eq(tables.user.id, ctx.session.user.id))
      return ctx.db.query.user.findFirst({
        where: eq(tables.user.id, ctx.session.user.id),
      })
    }),
  getUser: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.user.findFirst({
      where: eq(tables.user.name, input),
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
        eq(tables.notification.userId, ctx.session.user.id),
        eq(tables.notification.read, false),
      ),
      orderBy: (notification, { desc }) => [desc(notification.createdAt)],
    })
  }),
  markAllNotificationsAsRead: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db
      .update(tables.notification)
      .set({ read: true })
      .where(eq(tables.notification.userId, ctx.session.user.id))
  }),
  markNotificationAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tables.notification)
        .set({ read: true })
        .where(
          and(
            eq(tables.notification.id, input),
            eq(tables.notification.userId, ctx.session.user.id),
          ),
        )
      return ctx.db.query.notification.findMany({
        where: and(
          eq(tables.notification.userId, ctx.session.user.id),
          eq(tables.notification.read, false),
        ),
        orderBy: (notification, { desc }) => [desc(notification.createdAt)],
      })
    }),
  markEventNotificationsAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tables.notification)
        .set({ read: true })
        .where(
          and(
            eq(tables.notification.eventId, input),
            eq(tables.notification.userId, ctx.session.user.id),
          ),
        )
      return ctx.db.query.notification.findMany({
        where: and(
          eq(tables.notification.userId, ctx.session.user.id),
          eq(tables.notification.read, false),
        ),
        orderBy: (notification, { desc }) => [desc(notification.createdAt)],
      })
    }),
})
