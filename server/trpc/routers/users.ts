import { z } from "zod"

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc"
import { TRPCError } from "@trpc/server"

export const usersRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      })
    }),
  getUserCount: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.count()
  }),
})
