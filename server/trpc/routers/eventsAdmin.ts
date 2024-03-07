import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, eq, like } from 'drizzle-orm'
import { createTRPCRouter, adminProcedure, adminOnlyProcedure } from '../trpc'

import {
  event,
  optionSet,
  option,
  eventSection,
  question,
  eventEntry,
  eventEntrySection,
  eventEntryQuestion,
  notification,
} from '~/server/database/schema'

export const eventsAdminRouter = createTRPCRouter({
  addEvent: adminProcedure.mutation(async ({ ctx }) => {
    const createdEvent = await ctx.db
      .insert(tables.event)
      .values({})
      .returning()
    return createdEvent.pop()
  }),
  getEvents: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.event.findMany()
  }),
  getEvent: adminProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, input),
      with: {
        entries: {
          with: {
            user: { columns: { id: true, name: true, image: true } },
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
  getEventEntries: adminProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, input),
      with: {
        entries: {
          with: { user: { columns: { id: true, name: true, image: true } } },
        },
      },
    })
  }),
  getEventEntry: adminProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.eventEntry.findFirst({
      where: (eventEntry, { eq }) => eq(eventEntry.id, input),
      with: {
        event: true,
        user: { columns: { id: true, name: true, image: true } },
        entrySections: {
          with: {
            section: true,
            entryQuestions: {
              with: {
                question: { with: { optionSet: { with: { options: true } } } },
                entryOption: true,
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
    .mutation(({ ctx, input }) => {
      return ctx.db.transaction(async tx => {
        for (const section of input.sections) {
          await tx
            .update(eventSection)
            .set({
              heading: section.heading,
              description: section.description,
              order: section.order,
            })
            .where(eq(eventSection.id, section.id))

          // update questions
          for (const q of section.questions) {
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
              .where(eq(question.id, q.id))
          }
        }
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
        slug: z.string().optional(),
        information: z.string().optional(),
        status: z
          .enum(['DRAFT', 'PUBLISHED', 'DELETED', 'FINISHED'])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(event).set(input).where(eq(event.id, input.id))
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input.id),
      })
    }),
  deleteEvent: adminProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db
      .update(event)
      .set({ status: 'DELETED' })
      .where(eq(event.id, input))
  }),
  addOptionSet: adminProcedure
    .input(
      z.object({
        title: z.string(),
        eventId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createdOptionSet = await ctx.db
        .insert(optionSet)
        .values(input)
        .returning()
      return ctx.db.query.optionSet.findFirst({
        where: (optionSet, { eq }) =>
          eq(optionSet.id, Number(createdOptionSet.pop()?.id)),
        with: {
          options: true,
        },
      })
    }),
  deleteOptionSet: adminProcedure
    .input(z.number())
    .mutation(({ ctx, input }) => {
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
      const createdOption = await ctx.db
        .insert(option)
        .values(input)
        .returning()
      return createdOption.pop()
    }),
  deleteOption: adminProcedure.input(z.number()).mutation(({ ctx, input }) => {
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
      const createdSection = await ctx.db
        .insert(eventSection)
        .values(input)
        .returning()
      const createdSectionId = createdSection.pop()?.id
      return ctx.db.query.eventSection.findFirst({
        where: (eventSection, { eq }) =>
          eq(eventSection.id, Number(createdSectionId)),
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
  deleteSection: adminProcedure.input(z.number()).mutation(({ ctx, input }) => {
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
      const createdQuestion = await ctx.db
        .insert(question)
        .values(input)
        .returning()
      return createdQuestion.pop()
    }),
  deleteQuestion: adminProcedure
    .input(z.number())
    .mutation(({ ctx, input }) => {
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
    .mutation(({ ctx, input }) => {
      return ctx.db.transaction(async tx => {
        for (const q of input) {
          await tx.update(question).set(q).where(eq(question.id, q.id))
        }

        return true
      })
    }),
  getEventsPage: adminProcedure
    .input(
      z.object({
        page: z.number().min(1),
        perPage: z.number().min(1).max(100),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findMany({
        orderBy: (event, { desc }) => [desc(event.id)],
        limit: input.perPage,
        offset: (input.page - 1) * input.perPage,
        where: (event, { ne }) => ne(event.status, 'DELETED'),
      })
    }),
  getEventCount: adminProcedure.query(async ({ ctx }) => {
    const num = await ctx.db.select().from(event)
    return num.length
  }),
  updateScores: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // update score
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
                  if (entryQuestion.entryNumber === closest.entryNumber)
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
              // update db for question
              if (questionScore !== entryQuestion.questionScore) {
                await tx
                  .update(eventEntryQuestion)
                  .set({
                    questionScore,
                  })
                  .where(eq(eventEntryQuestion.id, entryQuestion.id))
              }
            }
            totalScore += sectionScore
            // update db for section
            if (sectionScore !== section.sectionScore) {
              await tx
                .update(eventEntrySection)
                .set({
                  sectionScore,
                })
                .where(eq(eventEntrySection.id, section.id))
            }
          }

          if (totalScore !== entry.totalScore) {
            await tx
              .update(eventEntry)
              .set({ totalScore })
              .where(eq(eventEntry.id, entry.id))
          }
        }
      })

      // update ranks
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

      const rankingOrder = updatedEvent.entries.map((x, _y, z) => ({
        ...x,
        rank: z.filter(w => w.totalScore > x.totalScore).length + 1,
      }))
      await ctx.db.transaction(async tx => {
        // update ranks
        for (const entry of rankingOrder) {
          await tx
            .update(eventEntry)
            .set({ rank: entry.rank })
            .where(eq(eventEntry.id, entry.id))
        }
      })

      // create notification to users
      await ctx.db.transaction(async tx => {
        for (const entry of updatedEvent.entries) {
          await tx
            .update(notification)
            .set({ read: true })
            .where(
              and(
                like(
                  notification.body,
                  `%Results for ${updatedEvent.name} have been updated!%`
                ),
                eq(notification.eventId, updatedEvent.id)
              )
            )
          await tx.insert(notification).values({
            body: `Results for ${updatedEvent.name} have been updated!`,
            url: `/${updatedEvent.slug}`,
            userId: entry.userId,
            eventId: updatedEvent.id,
            createdAt: new Date(),
            icon: 'material-symbols:info-outline',
          })
        }
      })
      return true
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
  getOptionSetsForEvent: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.optionSet.findMany({
        where: (optionSet, { eq }) => eq(optionSet.eventId, input.eventId),
        with: {
          options: {
            orderBy: (option, { asc }) => [asc(option.order)],
          },
        },
      })
    }),
  getSlugValid: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const num = await ctx.db.select().from(event).where(eq(event.slug, input))
      if (num.length === 0) return true
      else return false
    }),
  resetResults: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async tx => {
        const eventToUpdate = await tx.query.event.findFirst({
          where: eq(event.id, input),
          with: {
            entries: {
              with: {
                entrySections: { with: { entryQuestions: true } },
              },
            },
            sections: {
              with: {
                questions: true,
              },
            },
          },
        })

        if (eventToUpdate) {
          for (const section of eventToUpdate.sections) {
            for (const q of section.questions) {
              await tx
                .update(question)
                .set({
                  optionId: null,
                  resultBoolean: null,
                  resultNumber: null,
                  resultString: null,
                })
                .where(eq(question.id, q.id))
            }
          }

          for (const entry of eventToUpdate.entries) {
            await tx
              .update(eventEntry)
              .set({ totalScore: 0, rank: 0 })
              .where(eq(eventEntry.id, entry.id))

            for (const section of entry.entrySections) {
              await tx
                .update(eventEntrySection)
                .set({ sectionScore: 0 })
                .where(eq(eventEntrySection.id, section.id))
              for (const question of section.entryQuestions) {
                await tx
                  .update(eventEntryQuestion)
                  .set({ questionScore: 0 })
                  .where(eq(eventEntryQuestion.id, question.id))
              }
            }
          }
        }
      })
      return true
    }),
  updateEntryAdmin: adminOnlyProcedure
    .input(
      z.object({
        id: z.number(),
        eventId: z.number(),
        updatedQuestions: z.array(
          z.object({
            id: z.number(),
            eventEntrySectionId: z.number(),
            entryString: z.string().nullable(),
            entryBoolean: z.boolean().nullable(),
            entryNumber: z.number().nullable(),
            entryOptionId: z.number().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        const event = await tx.query.event.findFirst({
          where: (event, { eq }) => eq(event.id, input.eventId),
        })
        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          })
        }

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
      })
    }),
  invalidEntries: adminProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.query.eventEntry.findMany({
        where: (eventEntry, { eq }) => eq(eventEntry.eventId, input),
        with: {
          entrySections: {
            with: {
              entryQuestions: {
                where: (eventEntryQuestion, { and, isNull }) =>
                  and(
                    isNull(eventEntryQuestion.entryNumber),
                    isNull(eventEntryQuestion.entryBoolean),
                    isNull(eventEntryQuestion.entryString)
                  ),
                with: {
                  question: true,
                  entryOption: true,
                },
              },
            },
          },
        },
      })

      const invalidEntriesIds = [] as number[]

      for (const entry of entries) {
        for (const section of entry.entrySections) {
          for (const question of section.entryQuestions) {
            if (question.question.type === 'MULTI' && !question.entryOption) {
              invalidEntriesIds.push(entry.id)
            } else if (
              question.question.type === 'TEXT' &&
              !question.entryString
            ) {
              invalidEntriesIds.push(entry.id)
            } else if (
              question.question.type === 'NUMBER' &&
              question.entryNumber === null
            ) {
              invalidEntriesIds.push(entry.id)
            } else if (
              question.question.type === 'TIME' &&
              !question.entryString
            ) {
              invalidEntriesIds.push(entry.id)
            } else if (
              question.question.type === 'BOOLEAN' &&
              question.entryBoolean === null
            ) {
              invalidEntriesIds.push(entry.id)
            }
          }
        }
      }
      return entries.filter(entry => invalidEntriesIds.includes(entry.id))
    }),
  getEventResults: adminProcedure.input(z.number()).query(({ ctx, input }) => {
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
  importOptionSet: adminProcedure
    .input(
      z.object({
        title: z.string(),
        eventId: z.number(),
        options: z.array(
          z.object({
            order: z.number(),
            title: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        const createdOptionSet = await tx
          .insert(optionSet)
          .values({
            title: input.title,
            eventId: input.eventId,
          })
          .returning()
        const id = createdOptionSet.pop()?.id as number
        tx.insert(option).values(
          input.options.map(o => ({
            order: o.order,
            title: o.title,
            optionSetId: Number(id),
          }))
        )
      })
    }),
})

const getSeconds = (hms: string): number => {
  const [hours, minutes, seconds] = hms.split(':')
  return +hours * 60 * 60 + +minutes * 60 + +seconds
}
