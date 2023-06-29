import { PrismaClient } from "@prisma/client"
import type { PrismaClient as PrismaClientEdge } from "@prisma/client"

let globalForPrisma = globalThis as unknown as { prisma: PrismaClientEdge }
if (process.env.NODE_ENV !== "production")
  globalForPrisma = globalThis as unknown as { prisma: PrismaClientEdge }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
