import { PrismaClient } from "@prisma/client"

let _prisma: PrismaClient

if (process.env.NODE_ENV === "development") {
  _prisma = new PrismaClient({
    log: ["error", "warn"],
  })
} else {
  _prisma = new PrismaClient({
    log: ["error"],
  })
}

export const prisma = _prisma
