import type { DiscordProfile } from '@auth/core/providers/discord'
import { and, eq, like } from 'drizzle-orm'
import { formatTimeAgo } from '@vueuse/core'

export default defineEventHandler(async () => {
  // update user discord avatars
  const users = await useDB().query.user.findMany({
    with: {
      accounts: {
        where: (account, { eq }) => eq(account.provider, 'discord'),
      },
    },
  })
  const updates = [] as { id: string, image: string }[]
  for (const u of users) {
    for (const account of u.accounts) {
      const allowedHosts = ['cdn.discordapp.com', 'www.cdn.discordapp.com']
      if (allowedHosts.includes(u?.image ?? '')) {
        // @ts-expect-error error
        const profile = (await $fetch(
          `https://discord.com/api/users/${account.providerAccountId}`,
          {
            // @ts-expect-error error
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          },
        )) as DiscordProfile
        let imageUrl = ''
        if (profile.avatar === null) {
          const defaultAvatarNumber = Number.parseInt(profile.discriminator) % 5
          imageUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        }
        else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png'
          imageUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }
        updates.push({
          id: u.id,
          image: imageUrl,
        })
      }
    }
  }

  const updateOperations = updates.map(u =>
    useDB()
      .update(tables.user)
      .set({ image: u.image })
      .where(eq(tables.user.id, u.id)),
  )
  if (isTuple(updateOperations))
    await useDB().batch(updateOperations)

  // send notifications to all users for when predictions are closing
  let events = await useDB().query.event.findMany({
    where: eq(tables.event.status, 'PUBLISHED'),
  })
  const userIds = await useDB().query.user.findMany({
    columns: { id: true },
  })
  events = events.filter(e => (e.closeDate as Date) > new Date())

  const newNotifications = [] as {
    body: string
    url: string
    eventId: number
    userId: string
    icon: string
    createdAt: Date
  }[]
  for (const e of events) {
    for (const userId of userIds) {
      const timeAgo = formatTimeAgo(e.closeDate as Date)
      newNotifications.push({
        body: `Predictions for ${e.name} close ${timeAgo}`,
        url: `/${e.slug}`,
        eventId: e.id,
        userId: userId.id,
        icon: 'material-symbols:contract-edit',
        createdAt: new Date(),
      })
    }

    const newNotificationsOperations = newNotifications.map(n =>
      useDB().insert(tables.notification).values(n),
    )

    await useDB().batch([
      useDB()
        .update(tables.notification)
        .set({ read: true })
        .where(
          and(
            like(tables.notification.body, `%Predictions for%`),
            eq(tables.notification.eventId, e.id),
          ),
        ),
      ...newNotificationsOperations,
    ])
  }
  return 'updated'
})
