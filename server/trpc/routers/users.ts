import { z } from "zod"

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  adminOnlyProcedure,
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
  getUserEntries: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findFirstOrThrow({
        where: {
          id: input,
        },
        include: {
          entries: true,
        },
      })
    }),
  updateUserRole: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.union([
          z.literal("USER"),
          z.literal("ADMIN"),
          z.literal("EDITOR"),
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          role: input.role,
        },
      })
    }),
})
