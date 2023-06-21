import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React
   * Context
   */
  interface Session {
    user?: {
      id: number
      role: Role
    } & DefaultSession["user"]
  }

  enum Role {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    USER = "USER",
  }
}
