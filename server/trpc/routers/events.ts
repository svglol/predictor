import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  eventEntry,
  eventEntrySection,
  eventEntryQuestion,
} from '~/drizzle/schema'
import { count, eq } from 'drizzle-orm'

export const eventsRouter = createTRPCRouter({
  getEvent: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.query.event.findFirst({
      where: (event, { eq }) => eq(event.id, input),
      with: {
        entries: {
          with: {
            user: true,
            scoreHistory: true,
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
  getEventWithSlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.slug, input),
        with: {
          entries: {
            orderBy: (entry, { asc }) => [asc(entry.rank)],
            with: {
              user: true,
              scoreHistory: true,
              entrySections: {
                with: {
                  entryQuestions: {
                    with: { question: true, entryOption: true },
                  },
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
          eq(eventEntry.userId, ctx.session.user.id) &&
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
          userId: ctx.session.user.id,
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
})
