import { z } from "zod"
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc"
import { TRPCError } from "@trpc/server"
/* eslint-enable @typescript-eslint/no-unused-vars */
import { init } from "@paralleldrive/cuid2"
import type { PrismaClient } from "@prisma/client"
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
                include: {
                  entryQuestions: {
                    include: { question: true, entryOption: true },
                  },
                },
              },
            },
          },
          sections: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
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
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        closeDate: z.date().optional(),
        visible: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  updateEventSectionsQuestions: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        closeDate: z.date().optional(),
        visible: z.boolean().optional(),
        sections: z.array(
          z.object({
            id: z.number(),
            heading: z.string(),
            description: z.string(),
            order: z.number(),
            questions: z.array(
              z.object({
                id: z.number(),
                question: z.string(),
                type: z.enum(["MULTI", "TIME", "NUMBER", "TEXT", "BOOLEAN"]),
                optionSetId: z.number().nullish(),
                order: z.number(),
                points: z.number().optional(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mutations: any[] = []
      mutations.push(
        ctx.prisma.event.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            description: input.description,
            startDate: input.startDate,
            endDate: input.endDate,
            closeDate: input.closeDate,
            visible: input.visible,
          },
        }),
      )
      input.sections.forEach((section) => {
        mutations.push(
          ctx.prisma.eventSection.update({
            where: {
              id: section.id,
            },
            data: {
              heading: section.heading,
              description: section.description,
              order: section.order,
            },
          }),
        )
        section.questions.forEach((question) => {
          mutations.push(
            ctx.prisma.question.update({
              where: {
                id: question.id,
              },
              data: {
                question: question.question,
                type: question.type,
                optionSetId: question.optionSetId,
                order: question.order,
                points: question.points,
              },
            }),
          )
        })
      })

      return ctx.prisma.$transaction(mutations)
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
      }),
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
      }),
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
      }),
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
      }),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.create({
        data: input,
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              resultOption: true,
              optionSet: { include: { options: true } },
            },
          },
        },
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
      }),
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
        question: z.string().nullish(),
        type: z.enum(["MULTI", "TIME", "NUMBER", "TEXT", "BOOLEAN"]).nullish(),
        optionSetId: z.number().nullish(),
        points: z.number().optional(),
      }),
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
      }),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
  updateSectionResults: adminProcedure
    .input(
      z.array(
        z.object({
          questions: z.array(
            z.object({
              id: z.number(),
              resultString: z.string().nullish(),
              resultBoolean: z.boolean().nullish(),
              resultNumber: z.number().nullish(),
              optionId: z.number().nullish(),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mutations: any[] = []
      input.forEach((section) => {
        section.questions.forEach((question) => {
          mutations.push(
            ctx.prisma.question.update({
              where: {
                id: question.id,
              },
              data: question,
            }),
          )
        })
      })
      return ctx.prisma.$transaction(mutations)
    }),
  getOptionSetsPage: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.findMany({
        orderBy: { id: "desc" },
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
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findMany({
        orderBy: { id: "desc" },
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
          }),
        ),
      }),
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
      }),
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
        }),
      ),
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
  getEventEntries: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUniqueOrThrow({
        where: {
          id: input,
        },
        include: {
          entries: {
            include: {
              user: true,
            },
          },
        },
      })
    }),
  getEventsVisible: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: {
        startDate: "desc",
      },
      where: {
        visible: true,
      },
    })
  }),
  updateScores: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return updateScores(input, ctx.prisma).then(() => {
        updateRanks(input, ctx.prisma)
      })
    }),
  getEventEntry: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.eventEntry.findUnique({
        include: {
          user: true,
          entrySections: {
            include: {
              section: true,
              entryQuestions: {
                include: { question: true, entryOption: true },
              },
            },
          },
        },
        where: {
          id: input,
        },
      })
    }),
  updateEventInformation: adminProcedure
    .input(
      z.object({
        id: z.number(),
        information: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.update({
        where: {
          id: input.id,
        },
        data: {
          information: input.information,
        },
      })
    }),
})

const updateScores = async (eventId: number, prisma: PrismaClient) => {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      entries: {
        include: {
          user: true,
          entrySections: {
            include: { entryQuestions: { include: { question: true } } },
          },
        },
      },
    },
  })
  if (!event) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Event not found",
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutations: any[] = []
  for (const entry of event.entries) {
    let totalScore = 0
    for (const section of entry.entrySections) {
      let sectionScore = 0
      for (const entryQuestion of section.entryQuestions) {
        let questionScore = 0
        const type = entryQuestion.question.type
        let correct = false
        if (type === "MULTI") {
          if (entryQuestion.entryOptionId === entryQuestion.question.optionId)
            correct = true
        }
        if (type === "TIME") {
          const entryQuestions = await prisma.eventEntryQuestion.findMany({
            where: {
              questionId: entryQuestion.questionId,
            },
          })
          if (entryQuestions && entryQuestion.question.resultString) {
            const result = getSeconds(entryQuestion.question.resultString)
            const closest = entryQuestions.reduce(function (prev, curr) {
              return Math.abs(getSeconds(curr.entryString ?? "") - result) <
                Math.abs(getSeconds(prev.entryString ?? "") - result)
                ? curr
                : prev
            })
            if (entryQuestion.entryString === closest.entryString) {
              correct = true
            }
          }
        }
        if (type === "NUMBER") {
          //get array of entryQuestions of this question
          const entryQuestions = await prisma.eventEntryQuestion.findMany({
            where: {
              questionId: entryQuestion.questionId,
            },
          })

          if (entryQuestions && entryQuestion.question.resultNumber) {
            const result = entryQuestion.question.resultNumber
            const closest = entryQuestions.reduce(function (prev, curr) {
              return Math.abs((curr.entryNumber ?? 0) - result) <
                Math.abs((prev.entryNumber ?? 0) - result)
                ? curr
                : prev
            })
            if (entryQuestion.entryNumber == closest.entryNumber) correct = true
          }
        }
        if (type === "TEXT") {
          if (entryQuestion.entryString === entryQuestion.question.resultString)
            correct = true
        }
        if (type === "BOOLEAN") {
          if (
            entryQuestion.entryBoolean === entryQuestion.question.resultBoolean
          )
            correct = true
        }
        if (correct) questionScore += entryQuestion.question.points
        sectionScore += questionScore
        //update db for question
        mutations.push(
          prisma.eventEntryQuestion.update({
            where: {
              id: entryQuestion.id,
            },
            data: {
              questionScore: questionScore,
            },
          }),
        )
      }
      totalScore += sectionScore
      //update db for section
      mutations.push(
        prisma.eventEntrySection.update({
          where: {
            id: section.id,
          },
          data: {
            sectionScore: sectionScore,
          },
        }),
      )
    }

    mutations.push(
      prisma.eventEntry.update({
        where: {
          id: entry.id,
        },
        data: {
          totalScore: totalScore,
        },
      }),
    )
  }
  return prisma.$transaction(mutations)
}

const updateRanks = async (eventId: number, prisma: PrismaClient) => {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      entries: {
        orderBy: {
          totalScore: "desc",
        },
      },
    },
  })
  if (!event) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Event not found",
    })
  }

  const rankingOrder = event.entries.map((x, y, z) => ({
    ...x,
    rank: z.filter((w) => w.totalScore > x.totalScore).length + 1,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutations: any[] = []
  rankingOrder.forEach(async (entry) => {
    mutations.push(
      prisma.eventEntry.update({
        where: {
          id: entry.id,
        },
        data: {
          rank: entry.rank,
        },
      }),
    )
  })
  return prisma.$transaction(mutations)
}

const getSeconds = (hms: string): number => {
  const [hours, minutes, seconds] = hms.split(":")
  return +hours * 60 * 60 + +minutes * 60 + +seconds
}
