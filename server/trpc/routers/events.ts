import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '../trpc'
import { TRPCError } from '@trpc/server'
import { init } from '@paralleldrive/cuid2'
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
  getEvent: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
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
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
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
                orderBy: { order: 'asc' },
                include: {
                  resultOption: true,
                  optionSet: {
                    include: { options: { orderBy: { order: 'asc' } } },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        cacheStrategy: {
          ttl: 60,
          swr: 60,
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
                orderBy: { order: 'asc' },
                include: {
                  resultOption: true,
                  optionSet: {
                    include: { options: { orderBy: { order: 'asc' } } },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
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
  updateEventSectionsQuestions: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        image: z.string().optional(),
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
                hint: z.string().optional(),
                type: z.enum(['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN']),
                optionSetId: z.number().nullish(),
                order: z.number(),
                points: z.number().optional(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async tx => {
        //update event
        await tx.event.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            description: input.description,
            image: input.image,
            startDate: input.startDate,
            endDate: input.endDate,
            closeDate: input.closeDate,
            visible: input.visible,
          },
        })

        //update sections
        await Promise.all(
          input.sections.map(async section => {
            await tx.eventSection.update({
              where: {
                id: section.id,
              },
              data: {
                heading: section.heading,
                description: section.description,
                order: section.order,
              },
            })
            //update questions
            await Promise.all(
              section.questions.map(async question => {
                await tx.question.update({
                  where: {
                    id: question.id,
                  },
                  data: {
                    question: question.question,
                    hint: question.hint,
                    type: question.type,
                    optionSetId: question.optionSetId,
                    order: question.order,
                    points: question.points,
                  },
                })
              })
            )
          })
        )
        return true
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
        options: { orderBy: { order: 'asc' } },
      },
    })
  }),
  addOptionSet: adminProcedure
    .input(
      z.object({
        title: z.string(),
        eventId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.create({
        data: input,
        include: {
          options: true,
        },
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
          options: { orderBy: { order: 'asc' } },
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
        include: {
          options: true,
        },
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
        include: {
          questions: {
            orderBy: { order: 'asc' },
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
  addQuestion: adminProcedure
    .input(
      z.object({
        eventSectionId: z.number(),
        order: z.number(),
        question: z.string().nullish(),
        type: z.enum(['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN']).nullish(),
        optionSetId: z.number().nullish(),
        points: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.create({
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
            })
          ),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async tx => {
        return Promise.all(
          input.map(async section => {
            await Promise.all(
              section.questions.map(async question => {
                await tx.question.update({
                  where: {
                    id: question.id,
                  },
                  data: question,
                })
              })
            )
          })
        )
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
        orderBy: { id: 'desc' },
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
        orderBy: { id: 'desc' },
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
            entryQuestions: z.array(
              z.object({
                questionId: z.number(),
                eventEntrySectionId: z.number(),
                entryString: z.string().optional(),
                entryBoolean: z.boolean().optional(),
                entryNumber: z.number().optional(),
                entryOptionId: z.number().optional(),
              })
            ),
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
          code: 'BAD_REQUEST',
          message: 'User already has an entry for this event',
        })
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.eventId,
        },
      })
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      const now = new Date()
      if ((event.closeDate ?? new Date()) < now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Entries are closed for this event',
        })
      }

      return ctx.prisma.$transaction(async tx => {
        const eventEntry = await tx.eventEntry.create({
          data: {
            eventId: input.eventId,
            userId: Number(ctx.session.user.id),
            entrySections: {
              createMany: {
                data: input.entrySections.map(section => {
                  return { sectionId: section.sectionId }
                }),
              },
            },
          },
          include: {
            entrySections: true,
          },
        })
        for (const entrySection of eventEntry.entrySections) {
          const questions = input.entrySections.flatMap(section => {
            return section.entryQuestions.filter(
              question =>
                question.eventEntrySectionId === entrySection.sectionId
            )
          })
          await tx.eventEntryQuestion.createMany({
            data: questions.map(question => {
              return {
                eventEntrySectionId: entrySection.id,
                questionId: question.questionId,
                entryString: question.entryString,
                entryBoolean: question.entryBoolean,
                entryNumber: question.entryNumber,
                entryOptionId: question.entryOptionId,
              }
            }),
          })
        }
        return { eventEntry }
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
  getEventsVisible: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: {
        startDate: 'asc',
      },
      where: {
        visible: true,
      },
    })
  }),
  getEntriesForStandings: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        entries: { include: { event: true } },
      },
    })
  }),
  updateScores: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      //update score
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input,
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
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      const entryQuestions = event.entries.flatMap(entry => {
        return entry.entrySections.flatMap(entrySection => {
          return entrySection.entryQuestions
        })
      })

      await ctx.prisma.$transaction(async tx => {
        for (const entry of event.entries) {
          let totalScore = 0
          for (const section of entry.entrySections) {
            let sectionScore = 0
            for (const entryQuestion of section.entryQuestions) {
              let questionScore = 0
              const type = entryQuestion.question.type
              let correct = false
              if (type === 'MULTI') {
                if (
                  entryQuestion.entryOptionId ===
                  entryQuestion.question.optionId
                )
                  correct = true
              }
              if (type === 'TIME') {
                const filteredEntryQuestions = entryQuestions.filter(
                  question => question.questionId === entryQuestion.questionId
                )
                if (
                  filteredEntryQuestions &&
                  entryQuestion.question.resultString
                ) {
                  const result = getSeconds(entryQuestion.question.resultString)
                  const closest = filteredEntryQuestions.reduce(
                    function (prev, curr) {
                      return Math.abs(
                        getSeconds(curr.entryString ?? '') - result
                      ) < Math.abs(getSeconds(prev.entryString ?? '') - result)
                        ? curr
                        : prev
                    }
                  )
                  if (entryQuestion.entryString === closest.entryString) {
                    correct = true
                  }
                }
              }
              if (type === 'NUMBER') {
                const filteredEntryQuestions = entryQuestions.filter(
                  question => question.questionId === entryQuestion.questionId
                )
                if (
                  filteredEntryQuestions &&
                  entryQuestion.question.resultNumber !== null
                ) {
                  const result = entryQuestion.question.resultNumber
                  const closest = filteredEntryQuestions.reduce(
                    function (prev, curr) {
                      return Math.abs((curr.entryNumber ?? 0) - result) <
                        Math.abs((prev.entryNumber ?? 0) - result)
                        ? curr
                        : prev
                    }
                  )
                  if (entryQuestion.entryNumber == closest.entryNumber)
                    correct = true
                }
              }
              if (type === 'TEXT') {
                if (
                  entryQuestion.entryString ===
                  entryQuestion.question.resultString
                )
                  correct = true
              }
              if (type === 'BOOLEAN') {
                if (
                  entryQuestion.entryBoolean ===
                  entryQuestion.question.resultBoolean
                )
                  correct = true
              }
              if (correct) questionScore += entryQuestion.question.points
              sectionScore += questionScore
              //update db for question
              if (questionScore !== entryQuestion.questionScore) {
                await tx.eventEntryQuestion.update({
                  where: {
                    id: entryQuestion.id,
                  },
                  data: {
                    questionScore: questionScore,
                  },
                })
              }
            }
            totalScore += sectionScore
            //update db for section
            if (sectionScore !== section.sectionScore) {
              await tx.eventEntrySection.update({
                where: {
                  id: section.id,
                },
                data: {
                  sectionScore: sectionScore,
                },
              })
            }
          }

          if (totalScore !== entry.totalScore) {
            await tx.eventEntry.update({
              where: {
                id: entry.id,
              },
              data: {
                totalScore: totalScore,
              },
            })
          }
        }
      })

      //update ranks
      const updatedEvent = await ctx.prisma.event.findUnique({
        where: {
          id: input,
        },
        include: {
          entries: {
            orderBy: {
              totalScore: 'desc',
            },
          },
        },
      })
      if (!updatedEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      const rankingOrder = updatedEvent.entries.map((x, y, z) => ({
        ...x,
        rank: z.filter(w => w.totalScore > x.totalScore).length + 1,
      }))
      await ctx.prisma.$transaction(async tx => {
        await Promise.all(
          rankingOrder.map(async entry => {
            return tx.eventEntry.update({
              where: {
                id: entry.id,
              },
              data: {
                rank: entry.rank,
              },
            })
          })
        )
      })
    }),
  getEventEntry: protectedProcedure
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
      })
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
  getPublicEvent: publicProcedure
    .input(
      z.object({ id: z.number().nullish(), inviteId: z.string().nullish() })
    )
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.inviteId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Must provide either id or inviteId',
        })
      }
      return ctx.prisma.event.findFirst({
        where: {
          OR: [
            {
              id: input.id != null ? input.id : undefined,
            },
            {
              inviteId: input.inviteId != null ? input.inviteId : undefined,
            },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          visible: true,
        },
      })
    }),
  getOptionSetsForEvent: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.findMany({
        where: {
          eventId: input.eventId,
        },
        include: {
          options: { orderBy: { order: 'asc' } },
        },
      })
    }),
  deleteEventEntry: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventEntry.delete({
        where: {
          id: input,
        },
      })
    }),
})

const getSeconds = (hms: string): number => {
  const [hours, minutes, seconds] = hms.split(':')
  return +hours * 60 * 60 + +minutes * 60 + +seconds
}
