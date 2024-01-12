import { authOptions } from './auth/[...]'
import { getServerSession } from '#auth'
export default defineEventHandler(async event => {
  const session = await getServerSession(event, authOptions)
  if (session.user !== null) {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)
    return await $fetch(config.discordWebhook, {
      method: 'post',
      body: body,
    })
  }
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
  })
})
