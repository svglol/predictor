/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see context.ts).
 * 2. You want to create a new middleware or type of procedure (see Part 2).
 *
 * tl;dr - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

// import { type Session } from "next-auth"
import type { Session } from '@auth/core/types'
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when processing a request
 */
import type { H3Event } from 'h3'

import { getServerSession } from '#auth'
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { authOptions } from '~/server/api/auth/[...]'

interface CreateContextOptions {
  session: Session | null
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
function createInnerTRPCContext(opts: CreateContextOptions) {
  return {
    session: opts.session,
    db: useDB(),
  }
}
/**
 * This is the actual context you'll use in your router. It will be used to process every request
 * that goes through your tRPC endpoint
 *
 * @link https://trpc.io/docs/context
 */
export async function createTRPCContext(event: H3Event) {
  // Get the session from the server using the unstable_getServerSession wrapper function

  const session = await getServerSession(event, authOptions)

  return createInnerTRPCContext({
    session,
  })
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

/** Reusable middleware that enforces users are logged in before running the procedure */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})
/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees ctx.session.user is not null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

const enforceUserIsAdminOrEditor = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  if (ctx.session.user.role === 'USER')
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Protected (admin) procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin in users, use this. It verifies
 * the session is valid and guarantees ctx.session.user is not null
 *
 * @see https://trpc.io/docs/procedures
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdminOrEditor)

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  if (ctx.session.user.role !== 'ADMIN')
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Protected (admin) procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin in users, use this. It verifies
 * the session is valid and guarantees ctx.session.user is not null
 *
 * @see https://trpc.io/docs/procedures
 */
export const adminOnlyProcedure = t.procedure.use(enforceUserIsAdmin)
