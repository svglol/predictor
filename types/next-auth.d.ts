import { type DefaultSession, type DefaultUser } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React
   * Context
   */
  interface Session {
    user?: {
      id: number
      role: string
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: string
  }
}
