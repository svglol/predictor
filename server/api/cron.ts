import type { DiscordProfile } from '@auth/core/providers/discord'
import { and, eq, like } from 'drizzle-orm'
import { formatTimeAgo } from '@vueuse/core'
import { user, event, notification } from '~/server/db/schema'
import { db } from '~/server/db/db'

export default defineEventHandler(async () => {
  // update user discord avatars
  await db.transaction(async tx => {
    const users = await tx.query.user.findMany({
      with: {
        accounts: {
          where: (account, { eq }) => eq(account.provider, 'discord'),
        },
      },
    })

    for (const u of users) {
      for (const account of u.accounts) {
        // @ts-ignore
        if (u.image?.startsWith('https://cdn.discordapp.com') ?? true) {
          const profile = (await $fetch(
            `https://discord.com/api/users/${account.providerAccountId}`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            }
          )) as DiscordProfile
          let imageUrl = ''
          if (profile.avatar === null) {
            const defaultAvatarNumber = parseInt(profile.discriminator) % 5
            imageUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
          } else {
            const format = profile.avatar.startsWith('a_') ? 'gif' : 'png'
            imageUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
          }
          await tx
            .update(user)
            .set({ image: imageUrl })
            .where(eq(user.id, u.id))
        }
      }
    }
  })

  // send notifications to all users for when predictions are closing
  let events = await db.query.event.findMany({
    where: eq(event.status, 'PUBLISHED'),
  })
  const userIds = await db.query.user.findMany({
    columns: { id: true },
  })
  events = events.filter(e => (e.closeDate as Date) > new Date())
  for (const e of events) {
    await db.transaction(async tx => {
      for (const userId of userIds) {
        // Mark old notifications as read
        await tx
          .update(notification)
          .set({ read: true })
          .where(
            and(
              eq(notification.userId, userId.id),
              like(notification.body, `%Predictions for%`),
              eq(notification.eventId, e.id)
            )
          )
        const timeAgo = formatTimeAgo(e.closeDate as Date)
        await tx.insert(notification).values({
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
