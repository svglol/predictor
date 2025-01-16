import { eventsAdminRouter } from '~/server/trpc/routers/eventsAdmin'
import { eventsRouter } from './routers/events'
import { usersRouter } from './routers/users'
import { usersAdminRouter } from './routers/usersAdmin'
import { webhookRouter } from './routers/webhook'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  events: eventsRouter,
  webhook: webhookRouter,
  usersAdmin: usersAdminRouter,
  eventsAdmin: eventsAdminRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
