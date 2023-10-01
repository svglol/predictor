import type { DiscordProfile } from '@auth/core/providers/discord'
import DiscordProvider from '@auth/core/providers/discord'
import type { AuthConfig } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '~~/server/db'
// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.
let callbackURL = ''
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
      callbackURL = returnUrl
      return returnUrl
    },
    async signIn({ account }) {
      // const response = await fetch(`https://discord.com/api/users/@me/guilds`, {
      //   headers: {
      //     Authorization: `Bearer ${account?.access_token}`,
      //   },
      // })
      // if (response.status !== 200) return false
      // const servers = await response.json()

      let isAllowedToSignIn = false
      // servers.forEach((guild: { id: string | undefined }) => {
      //   if (guild.id === process.env.DISCORD_SERVER_ID) isAllowedToSignIn = true
      // })

      if (callbackURL) {
        const inviteId = callbackURL.split('/i/')[1]
        console.log(inviteId)
        if (/^[a-zA-Z0-9\b]{5}$/.test(inviteId)) {
          const event = await prisma.event.findUnique({
            where: {
              inviteId,
            },
          })

          if (
            event &&
            (event.closeDate ?? new Date()) > new Date() &&
            event.visible
          ) {
            isAllowedToSignIn = true
          }
        }
      }

      // const prismaAccount = await prisma.account.findFirst({
      //   where: {
      //     providerAccountId: account?.providerAccountId ?? '',
      //   },
      // })
      // if (prismaAccount) isAllowedToSignIn = true

      return isAllowedToSignIn
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
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/login',
  },
}

export default NuxtAuthHandler(authOptions, runtimeConfig)

// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
