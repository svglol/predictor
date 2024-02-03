import { db as database } from '~/server/db'
import { authOptions } from '~/server/api/auth/[...]'
import { getServerSession } from '#auth'
import type { H3Event } from 'h3'

export const db = database

export async function protectedRoute(event: H3Event) {
  const session = await getServerSession(event, authOptions)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

export async function adminRoute(event: H3Event) {
  const session = await getServerSession(event, authOptions)
  if (!session || !session.user || session.user.role === 'USER') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

export async function adminOnlyRoute(event: H3Event) {
  const session = await getServerSession(event, authOptions)
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
