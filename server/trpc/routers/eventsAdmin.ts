import { z } from 'zod'
import { createTRPCRouter, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

import {
  event,
  optionSet,
  option,
  eventSection,
  question,
  eventEntry,
  eventEntrySection,
  eventEntryQuestion,
  entryScore,
} from '~/drizzle/schema'
import { count, eq } from 'drizzle-orm'

export const eventsAdminRouter = createTRPCRouter({
  addEvent: adminProcedure.mutation(async ({ ctx }) => {
    const createdEvent = await ctx.db.insert(event).values({})
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, Number(createdEvent.insertId)),
    })
  }),
  getEvents: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.event.findMany()
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
        visible: z.boolean().optional(),
        slug: z.string().optional(),
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
  updateScores: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      //update score
      const event = await ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          entries: {
            with: {
              scoreHistory: true,
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
          await tx.insert(entryScore).values({
            entryId: entry.id,
            score: totalScore,
          })
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
        //update ranks
        for (const entry of rankingOrder) {
          await tx
            .update(eventEntry)
            .set({ rank: entry.rank })
            .where(eq(eventEntry.id, entry.id))
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
  getSlugValid: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const num = await ctx.db
        .select({ value: count() })
        .from(event)
        .where(eq(event.slug, input))
      if (num[0].value === 0) return true
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
                scoreHistory: true,
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

            for (const score of entry.scoreHistory) {
              await tx
                .delete(entryScore)
                .where(
                  eq(entryScore.entryId, entry.id) &&
                    eq(entryScore.createdAt, score.createdAt)
                )
            }

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
})

const getSeconds = (hms: string): number => {
  const [hours, minutes, seconds] = hms.split(':')
  return +hours * 60 * 60 + +minutes * 60 + +seconds
}
