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

import {
  event,
  optionSet,
  option,
  eventSection,
  question,
  eventEntry,
  eventEntrySection,
  eventEntryQuestion,
} from '~/drizzle/schema'
import { count, eq } from 'drizzle-orm'

export const eventsRouter = createTRPCRouter({
  addEvent: adminProcedure.mutation(async ({ ctx }) => {
    const createdEvent = await ctx.db.insert(event).values({
      inviteId: createId(),
    })
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, Number(createdEvent.insertId)),
    })
  }),
  getEvents: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.event.findMany()
  }),
  getEvent: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, input),
      with: {
        entries: {
          with: {
            user: true,
            entrySections: {
              with: {
                entryQuestions: { with: { question: true, entryOption: true } },
              },
            },
          },
        },
        sections: {
          orderBy: (section, { asc }) => [asc(section.order)],
          with: {
            questions: {
              orderBy: (question, { asc }) => [asc(question.order)],
              with: {
                resultOption: true,
                optionSet: { with: { options: true } },
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
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.inviteId, input),
        with: {
          sections: {
            orderBy: (section, { asc }) => [asc(section.order)],
            with: {
              questions: {
                orderBy: (question, { asc }) => [asc(question.order)],
                with: {
                  resultOption: true,
                  optionSet: { with: { options: true } },
                },
              },
            },
          },
        },
      })
    }),
  getEventResults: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          sections: {
            orderBy: (section, { asc }) => [asc(section.order)],
            with: {
              questions: {
                orderBy: (question, { asc }) => [asc(question.order)],
                with: {
                  resultOption: true,
                  optionSet: { with: { options: true } },
                },
              },
            },
          },
        },
      })
    }),
  updateEventSectionsQuestions: adminProcedure
    .input(
      z.object({
        id: z.number(),
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
      return ctx.db.transaction(async tx => {
        //update sections
        await Promise.all(
          input.sections.map(async section => {
            await tx
              .update(eventSection)
              .set({
                heading: section.heading,
                description: section.description,
                order: section.order,
              })
              .where(eq(eventSection.id, section.id))

            // update questions
            await Promise.all(
              section.questions.map(async q => {
                await tx
                  .update(question)
                  .set({
                    question: q.question,
                    hint: q.hint,
                    type: q.type,
                    order: q.order,
                    points: q.points,
                    optionSetId: q.optionSetId,
                  })
                  .where(eq(question.id, question.id))
              })
            )
          })
        )
        return true
      })
    }),
  updateEventDetails: adminProcedure
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(event).set(input).where(eq(event.id, input.id))
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input.id),
      })
    }),
  deleteEvent: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(event).where(eq(event.id, input))
    }),
  getOptionSets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.optionSet.findMany({
      with: {
        options: { orderBy: (option, { asc }) => [asc(option.order)] },
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
      const createdOptionSet = await ctx.db.insert(optionSet).values(input)
      return ctx.db.query.optionSet.findFirst({
        where: (optionSet, { eq }) =>
          eq(optionSet.id, Number(createdOptionSet.insertId)),
        with: {
          options: true,
        },
      })
    }),
  getOptionSet: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.optionSet.findFirst({
        where: (optionSet, { eq }) => eq(optionSet.id, input),
        with: {
          options: { orderBy: (option, { asc }) => [asc(option.order)] },
        },
      })
    }),
  deleteOptionSet: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(optionSet).where(eq(optionSet.id, input))
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
      const createdOption = await ctx.db.insert(option).values(input)
      return ctx.db.query.option.findFirst({
        where: (option, { eq }) =>
          eq(option.id, Number(createdOption.insertId)),
      })
    }),
  deleteOption: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(option).where(eq(option.id, input))
    }),
  updateOptionSet: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(optionSet)
        .set(input)
        .where(eq(optionSet.id, input.id))

      return ctx.db.query.optionSet.findFirst({
        where: (optionSet, { eq }) => eq(optionSet.id, input.id),
        with: {
          options: { orderBy: (option, { asc }) => [asc(option.order)] },
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
      await ctx.db.update(option).set(input).where(eq(option.id, input.id))
      return ctx.db.query.option.findFirst({
        where: (option, { eq }) => eq(option.id, input.id),
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
      const createdSection = await ctx.db.insert(eventSection).values(input)
      return ctx.db.query.eventSection.findFirst({
        where: (eventSection, { eq }) =>
          eq(eventSection.id, Number(createdSection.insertId)),
        with: {
          questions: {
            orderBy: (question, { asc }) => [asc(question.order)],
            with: {
              resultOption: true,
              optionSet: { with: { options: true } },
            },
          },
        },
      })
    }),
  deleteSection: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(eventSection).where(eq(eventSection.id, input))
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
      const createdQuestion = await ctx.db.insert(question).values(input)
      return ctx.db.query.question.findFirst({
        where: (question, { eq }) =>
          eq(question.id, Number(createdQuestion.insertId)),
      })
    }),
  deleteQuestion: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(question).where(eq(question.id, input))
    }),
  updateQuestionResults: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          resultString: z.string().nullish(),
          resultBoolean: z.boolean().nullish(),
          resultNumber: z.number().nullish(),
          optionId: z.number().nullish(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(tx => {
        return Promise.all(
          input.map(async q => {
            await tx.update(question).set(q).where(eq(question.id, q.id))
          })
        )
      })
    }),
  getEventsPage: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.event.findMany({
        orderBy: (event, { desc }) => [desc(event.id)],
        limit: input.perPage,
        offset: (input.page - 1) * input.perPage,
      })
    }),
  getEventCount: adminProcedure.query(async ({ ctx }) => {
    const num = await ctx.db.select({ value: count() }).from(event)
    return num[0].value
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
      const numEntriesUser = await ctx.db
        .select({ value: count(eventEntry.id) })
        .from(eventEntry)
        .where(
          eq(eventEntry.userId, Number(ctx.session.user.id)) &&
            eq(eventEntry.eventId, input.eventId)
        )
      if (numEntriesUser[0].value > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already has an entry for this event',
        })
      }
      const event = await ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input.eventId),
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

      return ctx.db.transaction(async tx => {
        const createdEventEntry = await tx.insert(eventEntry).values({
          eventId: input.eventId,
          userId: Number(ctx.session.user.id),
        })
        for (const entrySection of input.entrySections) {
          const createdEntrySection = await tx
            .insert(eventEntrySection)
            .values({
              eventEntryId: Number(createdEventEntry.insertId),
              sectionId: entrySection.sectionId,
            })
          for (const question of entrySection.entryQuestions) {
            await tx.insert(eventEntryQuestion).values({
              eventEntrySectionId: Number(createdEntrySection.insertId),
              questionId: question.questionId,
              entryString: question.entryString,
              entryBoolean: question.entryBoolean,
              entryNumber: question.entryNumber,
              entryOptionId: question.entryOptionId,
            })
          }
          return tx.query.eventEntry.findFirst({
            where: (eventEntry, { eq }) =>
              eq(eventEntry.id, Number(createdEventEntry.insertId)),
          })
        }
      })
    }),
  updateEventEntry: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        eventId: z.number(),
        updatedQuestions: z.array(
          z.object({
            id: z.number(),
            eventEntrySectionId: z.number(),
            entryString: z.string().optional(),
            entryBoolean: z.boolean().optional(),
            entryNumber: z.number().optional(),
            entryOptionId: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input.eventId),
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
      return ctx.db.transaction(async tx => {
        await tx
          .update(eventEntry)
          .set({ updatedAt: new Date() })
          .where(eq(eventEntry.id, input.id))

        for (const entryQuestion of input.updatedQuestions) {
          await tx
            .update(eventEntryQuestion)
            .set({
              entryString: entryQuestion.entryString,
              entryBoolean: entryQuestion.entryBoolean,
              entryNumber: entryQuestion.entryNumber,
              entryOptionId: entryQuestion.entryOptionId,
            })
            .where(eq(eventEntryQuestion.id, entryQuestion.id))
        }
        return tx.query.eventEntry.findFirst({
          where: (eventEntry, { eq }) => eq(eventEntry.id, Number(input.id)),
        })
      })
    }),
  getEventEntries: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          entries: { with: { user: true } },
        },
      })
    }),
  getEventsVisible: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.event.findMany({
      where: (event, { eq }) => eq(event.visible, true),
      orderBy: (event, { desc }) => [desc(event.startDate)],
    })
  }),
  getEntriesForStandings: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findMany({
      with: {
        entries: { with: { event: true } },
      },
    })
  }),
  updateScores: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      //update score
      const event = await ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          entries: {
            with: {
              entrySections: {
                with: { entryQuestions: { with: { question: true } } },
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

      await ctx.db.transaction(async tx => {
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
                await tx
                  .update(eventEntryQuestion)
                  .set({
                    questionScore: questionScore,
                  })
                  .where(eq(eventEntryQuestion.id, entryQuestion.id))
              }
            }
            totalScore += sectionScore
            //update db for section
            if (sectionScore !== section.sectionScore) {
              await tx
                .update(eventEntrySection)
                .set({
                  sectionScore: sectionScore,
                })
                .where(eq(eventEntrySection.id, section.id))
            }
          }

          if (totalScore !== entry.totalScore) {
            await tx
              .update(eventEntry)
              .set({ totalScore: totalScore })
              .where(eq(eventEntry.id, entry.id))
          }
        }
      })

      //update ranks
      const updatedEvent = await ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          entries: { orderBy: (entry, { asc }) => [asc(entry.totalScore)] },
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
      await ctx.db.transaction(async tx => {
        await Promise.all(
          rankingOrder.map(async entry => {
            return tx
              .update(eventEntry)
              .set({ rank: entry.rank })
              .where(eq(eventEntry.id, entry.id))
          })
        )
      })
    }),
  getEventEntry: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.eventEntry.findFirst({
        where: (eventEntry, { eq }) => eq(eventEntry.id, input),
        with: {
          user: true,
          entrySections: {
            with: {
              section: true,
              entryQuestions: {
                with: { question: true, entryOption: true },
              },
            },
          },
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
      await ctx.db.update(event).set(input).where(eq(event.id, input.id))
      return ctx.db.query.event.findFirst({ where: eq(event.id, input.id) })
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
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) =>
          eq(event.id, Number(input.id)) ||
          eq(event.inviteId, String(input.inviteId)),
        columns: {
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
      return ctx.db.query.optionSet.findMany({
        where: (optionSet, { eq }) => eq(optionSet.eventId, input.eventId),
        with: {
          options: {
            orderBy: (option, { asc }) => [asc(option.order)],
          },
        },
      })
    }),
  // deleteEventEntry: protectedProcedure
  //   .input(z.number())
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.delete(eventEntry).where(eq(eventEntry.id, input))
  //   }),
})

const getSeconds = (hms: string): number => {
  const [hours, minutes, seconds] = hms.split(':')
  return +hours * 60 * 60 + +minutes * 60 + +seconds
}
