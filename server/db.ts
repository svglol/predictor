import type { PrismaClient } from "@prisma/client"
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"

let _prisma: PrismaClientEdge | PrismaClient
console.info("PRISMA_GENERATE_DATAPROXY", process.env.PRISMA_GENERATE_DATAPROXY)
_prisma = new PrismaClientEdge({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})
// if (process.env.PRISMA_GENERATE_DATAPROXY) {
//   _prisma = new PrismaClientEdge({
//     log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
//   })
// } else {
//   _prisma = new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
//   })
// }

export const prisma = _prisma
