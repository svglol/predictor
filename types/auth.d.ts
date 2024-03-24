import type { DefaultSession, DefaultUser } from '@auth/core/types'

declare module '@auth/core/types' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
  interface User extends DefaultUser {
    id: string
    role?: string
  }

  interface AdapterUser extends User {
    id: string
    email: string
    emailVerified: Date | null
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser extends User {
    id: string
    email: string
    emailVerified: Date | null
  }
}

declare module 'next-auth' {
  interface User {
    id: string
  }
}
