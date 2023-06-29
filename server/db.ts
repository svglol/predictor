import { PrismaClient } from "@prisma/client"
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || process.env.NODE_ENV === "development"
    ? new PrismaClient({
        log: ["error", "warn"],
      })
    : new PrismaClientEdge({
        log: ["error"],
      })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
