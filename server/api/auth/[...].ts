import { NuxtAuthHandler } from "#auth"
import type { DiscordProfile } from "next-auth/providers/discord"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "~~/server/db"
import Discord from "next-auth/providers/discord"

export default NuxtAuthHandler({
  secret: process.env.NEXTAUTH_SECRET,
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = Number(user.id)
        session.user.role = user.role
      }
      return session
    },
    async signIn({ account }) {
      const servers = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${account?.access_token}`,
        },
      })
      if (servers.status !== 200) return false
      const serversJson = await servers.json()
      let isAllowedToSignIn = false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serversJson.forEach((guild: any) => {
        if (guild.id === process.env.DISCORD_SERVER_ID) isAllowedToSignIn = true
      })
      if (isAllowedToSignIn) {
        return true
      } else {
        return false
      }
    },
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    // Change the default behavior to use `/login` as the path for the sign-in page
    signIn: "/login",
    error: "/error",
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    Discord.default({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "identify guilds email" } },
      profile(profile: DiscordProfile) {
        if (profile.id === process.env.DISCORD_ADMIN_USER_ID)
          return { role: "ADMIN", ...profile }
        return { role: "USER", ...profile }
      },
    }),
  ],
})
