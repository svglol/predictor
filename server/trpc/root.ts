import { createTRPCRouter } from './trpc'
import { usersRouter } from './routers/users'
import { eventsRouter } from './routers/events'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  events: eventsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
