import { count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '~/drizzle/schema'

export default defineEventHandler(async event => {
  await protectedRoute(event)
  const name = getRouterParam(event, 'name')
  const parsedName = z.string().parse(name)
  const num = await db
    .select({ value: count() })
    .from(user)
    .where(eq(user.name, parsedName))
  return num[0].value
})
