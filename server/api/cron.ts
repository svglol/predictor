import type { DiscordProfile } from '@auth/core/providers/discord'
import { formatTimeAgo } from '@vueuse/core'
import { and, eq, like } from 'drizzle-orm'

export default defineEventHandler(async () => {
  // update user discord avatars
  await useDB().transaction(async (tx) => {
    const users = await tx.query.user.findMany({
      with: {
        accounts: {
          where: (account, { eq }) => eq(account.provider, 'discord'),
        },
      },
    })

    for (const u of users) {
      for (const account of u.accounts) {
        if (u.image?.startsWith('https://cdn.discordapp.com') ?? true) {
          try {
            const profile = (await $fetch(
              `https://discord.com/api/users/${account.providerAccountId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
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
            await tx
              .update(tables.user)
              .set({ image: imageUrl })
              .where(eq(tables.user.id, u.id))
          }
          catch (error) {
            console.error(error)
          }
        }
      }
    }
  })

  // send notifications to all users for when predictions are closing
  let events = await useDB().query.event.findMany({
    where: eq(tables.event.status, 'PUBLISHED'),
  })
  const userIds = await useDB().query.user.findMany({
    columns: { id: true },
  })
  events = events.filter(e => (e.closeDate as Date) > new Date())
  for (const e of events) {
    await useDB().transaction(async (tx) => {
      for (const userId of userIds) {
        // Mark old notifications as read
        await tx
          .update(tables.notification)
          .set({ read: true })
          .where(
            and(
              eq(tables.notification.userId, userId.id),
              like(tables.notification.body, `%Predictions for%`),
              eq(tables.notification.eventId, e.id),
            ),
          )
        const timeAgo = formatTimeAgo(e.closeDate as Date)
        await tx.insert(tables.notification).values({
          body: `Predictions for ${e.name} close ${timeAgo}`,
          url: `/${e.slug}`,
          eventId: e.id,
          userId: userId.id,
          icon: 'material-symbols:contract-edit',
          createdAt: new Date(),
        })
      }
    })
  }
  return 'updated'
})
