import { z } from "zod"

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc"
import { TRPCError } from "@trpc/server"
import { init } from "@paralleldrive/cuid2"
const createId = init({
  length: 5,
})

export const eventsRouter = createTRPCRouter({
  addEvent: adminProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.event.create({
      data: { inviteId: createId() },
    })
  }),
  getEvents: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany()
  }),
  getEvent: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUniqueOrThrow({
        where: {
          id: input,
        },
        include: {
          _count: true,
          entries: {
            include: {
              user: true,
              entrySections: {
                include: { entryQuestions: { include: { question: true } } },
              },
            },
          },
          sections: {
            include: {
              questions: {
                include: {
                  resultOption: true,
                  optionSet: { include: { options: true } },
                },
              },
            },
          },
        },
      })
    }),
  getEventWithInvite: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUnique({
        where: {
          inviteId: input,
        },
        include: {
          sections: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  resultOption: true,
                  optionSet: {
                    include: { options: { orderBy: { order: "asc" } } },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      })
    }),
  getEventResults: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUnique({
        where: {
          id: input,
        },
        include: {
          sections: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  resultOption: true,
                  optionSet: {
                    include: { options: { orderBy: { order: "asc" } } },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      })
    }),
  updateEvent: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        event_start_date: z.date().optional(),
        event_end_date: z.date().optional(),
        predictions_close_date: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  deleteEvent: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.delete({
        where: {
          id: input,
        },
      })
    }),
  getOptionSets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.optionSet.findMany({
      include: {
        options: { orderBy: { order: "asc" } },
      },
    })
  }),
  addOptionSet: adminProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.create({
        data: input,
      })
    }),
  getOptionSet: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.findUnique({
        where: {
          id: input,
        },
        include: {
          _count: true,
          options: { orderBy: { order: "asc" } },
        },
      })
    }),
  deleteOptionSet: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.delete({
        where: {
          id: input,
        },
      })
    }),
  addOption: adminProcedure
    .input(
      z.object({
        title: z.string(),
        optionSetId: z.number(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.create({
        data: input,
      })
    }),
  deleteOption: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.delete({
        where: {
          id: input,
        },
      })
    }),
  updateOptionSet: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  updateOption: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  addSection: adminProcedure
    .input(
      z.object({
        eventId: z.number(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.create({
        data: input,
        include: { questions: { include: { resultOption: true } } },
      })
    }),
  deleteSection: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.delete({
        where: {
          id: input,
        },
      })
    }),
  updateSection: adminProcedure
    .input(
      z.object({
        id: z.number(),
        heading: z.string(),
        description: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  addQuestion: adminProcedure
    .input(
      z.object({
        eventSectionId: z.number(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.create({
        data: input,
      })
    }),
  updateQuestion: adminProcedure
    .input(
      z.object({
        id: z.number(),
        question: z.string(),
        type: z.enum(["MULTI", "TIME", "NUMBER", "TEXT", "BOOLEAN"]),
        optionSetId: z.number().nullish(),
        order: z.number(),
        points: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  deleteQuestion: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.delete({
        where: {
          id: input,
        },
      })
    }),
  updateQuestionResults: adminProcedure
    .input(
      z.object({
        id: z.number(),
        resultString: z.string().nullish(),
        resultBoolean: z.boolean().nullish(),
        resultNumber: z.number().nullish(),
        optionId: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  getOptionSetsPage: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.findMany({
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
        include: {
          options: true,
        },
      })
    }),
  getOptionSetCount: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.optionSet.count()
  }),
  getEventsPage: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      })
    }),
  getEventCount: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.count()
  }),
  addEventEntry: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        entrySections: z.array(
          z.object({
            sectionId: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const numEntriesUser = await ctx.prisma.eventEntry.count({
        where: {
          eventId: input.eventId,
          userId: Number(ctx.session.user.id),
        },
      })
      if (numEntriesUser > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has an entry for this event",
        })
      }
      return ctx.prisma.eventEntry.create({
        data: {
          eventId: input.eventId,
          userId: Number(ctx.session.user.id),
          entrySections: {
            createMany: {
              data: input.entrySections,
            },
          },
        },
        include: {
          entrySections: { include: { entryQuestions: true } },
        },
      })
    }),
  addEventEntrySection: protectedProcedure
    .input(z.object({ sectionId: z.number(), eventEntryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventEntrySection.create({
        data: input,
      })
    }),
  addEventEntryQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
        eventEntrySectionId: z.number(),
        entryString: z.string().nullish(),
        entryBoolean: z.boolean().nullish(),
        entryNumber: z.number().nullish(),
        entryOptionId: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventEntryQuestion.create({
        data: input,
      })
    }),
  addManyEventEntryQuestions: protectedProcedure
    .input(
      z.array(
        z.object({
          questionId: z.number(),
          eventEntrySectionId: z.number(),
          entryString: z.string().nullish(),
          entryBoolean: z.boolean().nullish(),
          entryNumber: z.number().nullish(),
          entryOptionId: z.number().nullish(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.prisma.eventEntrySection.findUnique({
        where: {
          id: input[0].eventEntrySectionId,
        },
        include: {
          eventEntry: true,
        },
      })
      if (section) {
        if (section.eventEntry.userId !== Number(ctx.session.user.id))
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User does not have access to this section",
          })
      }
      return ctx.prisma.eventEntryQuestion.createMany({
        data: input,
      })
    }),
})
