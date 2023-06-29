import { PrismaClient } from "@prisma/client"
import type { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"

let globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
if (process.env.NODE_ENV !== "development")
  globalForPrisma = globalThis as unknown as { prisma: PrismaClientEdge }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
