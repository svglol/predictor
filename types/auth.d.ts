import { type DefaultSession, type DefaultUser } from '@auth/core/types'

declare module '@auth/core/types' {
  interface Session {
    user: {
      id: number
      role: string
    } & DefaultSession['user']
  }
  interface User extends DefaultUser {
    id: number
    role?: string
  }

  interface AdapterUser extends User {
    id: number
    email: string
    emailVerified: Date | null
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser extends User {
    id: number
    email: string
    emailVerified: Date | null
  }
}

declare module 'next-auth' {
  interface User {
    id: number
  }
}
