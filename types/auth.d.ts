import { type DefaultSession, type DefaultUser } from "@auth/core/types"

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: number
      role: string
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    id: number
    role?: string
  }
}
