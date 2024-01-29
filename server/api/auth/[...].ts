import type { DiscordProfile } from '@auth/core/providers/discord'
import DiscordProvider from '@auth/core/providers/discord'
import type { AuthConfig } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'
import { db } from '~/server/db'
import { mySqlDrizzleAdapter } from '~/drizzle/drizzleAdapter'
import { eq } from 'drizzle-orm'
import { user as userSchema } from '~/drizzle/schema'

// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.
const runtimeConfig = useRuntimeConfig()
// Refer to Auth.js docs for more details
export const authOptions: AuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = Number(user.id)
        session.user.role = user.role || 'USER'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      let returnUrl = baseUrl
      // Allows relative callback URLs
      if (url.startsWith('/')) returnUrl = `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) returnUrl = url
      return returnUrl
    },
    async signIn({ user, profile }) {
      if (user) {
        const dbUser = await db.query.user.findFirst({
          where: (userSchema, { eq }) => eq(userSchema.id, Number(user.id)),
        })
        if (dbUser) {
          await db
            .update(userSchema)
            .set({
              name: String(profile?.username),
              email: profile?.email,
              image: String(profile?.image_url),
            })
            .where(eq(userSchema.id, Number(user.id)))
        }
      }
      return true
    },
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization:
        'https://discord.com/api/oauth2/authorize?scope=identify+email+guilds',
      profile(profile: DiscordProfile) {
        let role = 'USER'
        if (profile.id === process.env.DISCORD_ADMIN_USER_ID) {
          role = 'ADMIN'
        }
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png'
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
          role: role,
        }
      },
    }),
  ],
  adapter: mySqlDrizzleAdapter(db),
  pages: {
    signIn: '/login',
  },
}

// github.com/nextauthjs/next-auth/blob/main/packages/adapter-drizzle/src/lib/mysql.ts

export default NuxtAuthHandler(authOptions, runtimeConfig)

// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
