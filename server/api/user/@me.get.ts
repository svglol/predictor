import { authOptions } from '~/server/api/auth/[...]'
import { getServerSession } from '#auth'

export default defineEventHandler(async event => {
  await protectedRoute(event)
  const session = await getServerSession(event, authOptions)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
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
})
