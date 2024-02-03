import { authOptions } from '~/server/api/auth/[...]'
import { getServerSession } from '#auth'
import { z } from 'zod'
import { user } from '~/drizzle/schema'
import { eq } from 'drizzle-orm'

const userSchema = z.object({
  name: z.string().max(191),
  image: z.string(),
})

type UserSchema = z.infer<typeof userSchema>

export default defineEventHandler<{
  body: UserSchema
}>(async event => {
  await protectedRoute(event)
  const session = await getServerSession(event, authOptions)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const result = await readValidatedBody(event, body =>
    userSchema.safeParse(body)
  )
  if (result.success) {
    await db.update(user).set(result.data).where(eq(user.id, session.user.id))
    return db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    })
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.toString(),
    })
  }
})
