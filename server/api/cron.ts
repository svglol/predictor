import type { DiscordProfile } from '@auth/core/providers/discord'
import { eq } from 'drizzle-orm'
import { user } from '~/drizzle/schema'
import { db } from '~/server/db'

export default defineEventHandler(async () => {
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
          const profile: DiscordProfile = await $fetch(
            `https://discord.com/api/users/${account.providerAccountId}`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            }
          )
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
  return 'updated'
})
