import type { DiscordProfile } from '@auth/core/providers/discord'
import DiscordProvider from '@auth/core/providers/discord'
import type { AuthConfig } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { mySqlDrizzleAdapter } from '~/drizzle/drizzleAdapter'
import { user } from '~/drizzle/schema'

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
        session.user.id = user.id
        session.user.role = user.role || 'USER'
      }
      return session
    },
    redirect({ url, baseUrl }) {
      let returnUrl = baseUrl
      // Allows relative callback URLs
      if (url.startsWith('/')) returnUrl = `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) returnUrl = url
      return returnUrl
    },
    async signIn({ user: authUser }) {
      if (!authUser.name) {
        const name = authUser.email?.split('@')[0]
        await db.update(user).set({ name }).where(eq(user.id, authUser.id))
      }
      if (!authUser.image) {
        const image = `https://api.dicebear.com/7.x/bottts/png?seed=${authUser.email}`
        await db.update(user).set({ image }).where(eq(user.id, authUser.id))
      }
      return true
    },
  },
  providers: [
    {
      id: 'sendgrid',
      // @ts-expect-error any type
      type: 'email',
      async sendVerificationRequest({
        identifier: email,
        url,
      }: {
        identifier: string
        url: string
      }) {
        // Call the cloud Email provider API for sending emails
        // See https://docs.sendgrid.com/api-reference/mail-send/mail-send
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          // The body format will vary depending on provider, please see their documentation
          // for further details.
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: 'noreply@trotman.xyz' },
            subject: ' Sign in to Memespeak Predictor',
            content: [
              {
                type: 'text/plain',
                value: `Please click here to authenticate - ${url}`,
              },
            ],
          }),
          headers: {
            // Authentication will also vary from provider to provider, please see their docs.
            Authorization: `Bearer ${process.env.SENDGRID_API}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        if (!response.ok) {
          const { errors } = await response.json()
          throw new Error(JSON.stringify(errors))
        }
      },
    },
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
          role,
        }
      },
    }),
  ],
  adapter: mySqlDrizzleAdapter(db),
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
}

export default NuxtAuthHandler(authOptions, runtimeConfig)

// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
