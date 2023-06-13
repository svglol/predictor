import { NuxtAuthHandler } from "#auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "~~/server/db"

export default NuxtAuthHandler({
  secret: process.env.NEXTAUTH_SECRET,
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    // Change the default behavior to use `/login` as the path for the sign-in page
    signIn: "/login",
    error: "/error",
  },
  providers: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DiscordProvider.default({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
})
