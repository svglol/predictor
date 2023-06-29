import { PrismaClient } from "@prisma/client"
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientEdge | PrismaClient
// }

let prisma: PrismaClientEdge | PrismaClient

if (process.env.NODE_ENV === "development") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  })
} else {
  prisma = new PrismaClientEdge({
    log: ["error"],
  })
}

// export const prisma =
//   globalForPrisma.prisma || process.env.NODE_ENV === "development"
//     ? new PrismaClient({
//         log: ["error", "warn"],
//       })
//     : new PrismaClientEdge({
//         log: ["error"],
//       })

// if (process.env.NODE_ENV === "development") {
//   globalForPrisma.prisma = prisma
// }

export default prisma
