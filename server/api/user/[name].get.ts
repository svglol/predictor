import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '~/drizzle/schema'

export default defineEventHandler(async event => {
  const name = getRouterParam(event, 'name')
  const parsedName = z.string().parse(name)
  return db.query.user.findFirst({
    where: eq(user.name, parsedName),
    columns: {
      name: true,
      image: true,
    },
    with: {
      entries: { with: { event: true } },
    },
  })
})
