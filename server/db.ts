import { connect } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { fetch as undiciFetch } from 'undici'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const connection = connect({
  url: process.env.DATABASE_URL,
  fetch: undiciFetch,
})
const adapter = new PrismaPlanetScale(connection)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }).$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
