import { z } from "zod"
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  adminOnlyProcedure,
} from "../trpc"
import { TRPCError } from "@trpc/server"
/* eslint-enable @typescript-eslint/no-unused-vars */
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
        orderBy: {
          id: "desc",
        },
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
        include: {
          accounts: true,
        },
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
          entries: { include: { event: true } },
        },
      })
    }),
  updateUserRole: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          accounts: true,
        },
      })
      if (
        user?.accounts.filter(
          (account) =>
            account.providerAccountId === process.env.DISCORD_ADMIN_USER_ID
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is global admin",
        })
      } else {
        return ctx.prisma.user.update({
          where: {
            id: input.id,
          },
          data: {
            role: input.role,
          },
        })
      }
    }),
  getUser: adminProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findUnique({
      include: {
        entries: {
          include: {
            event: true,
          },
        },
      },
      where: {
        id: input,
      },
    })
  }),
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        entries: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            event: true,
          },
        },
      },
    })
  }),
})
