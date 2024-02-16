import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, count, eq, like, or } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import {
  eventEntry,
  eventEntrySection,
  eventEntryQuestion,
  user,
  notification,
} from '~/drizzle/schema'

export const eventsRouter = createTRPCRouter({
  getEvent: publicProcedure.input(z.number()).query(({ ctx, input }) => {
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
  getEventWithSlug: publicProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.slug, input),
        with: {
          entries: {
            orderBy: (entry, { asc }) => [asc(entry.rank)],
            with: {
              user: { columns: { id: true, name: true, image: true } },
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
  getEventResults: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => {
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
          and(
            eq(eventEntry.userId, ctx.session.user.id),
            eq(eventEntry.eventId, input.eventId)
          )
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
        }

        // send notification to admins
        const admins = await tx.query.user.findMany({
          where: or(eq(user.role, 'ADMIN'), eq(user.role, 'EDITOR')),
          columns: { id: true },
        })
        for (const admin of admins) {
          await tx.insert(notification).values({
            userId: admin.id,
            body: `${ctx.session.user.name} has submitted an entry for ${event.name}!`,
            url: `/${event.slug}`,
            eventId: event.id,
            createdAt: now,
            icon: 'material-symbols:contract-edit',
          })
        }

        return tx.query.eventEntry.findFirst({
          where: (eventEntry, { eq }) =>
            eq(eventEntry.id, Number(createdEventEntry.insertId)),
        })
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

        // send notification to admins
        const admins = await tx.query.user.findMany({
          where: or(eq(user.role, 'ADMIN'), eq(user.role, 'EDITOR')),
          columns: { id: true },
        })
        for (const admin of admins) {
          await tx
            .update(notification)
            .set({ read: true })
            .where(
              and(
                like(
                  notification.body,
                  `%${ctx.session.user.name} has updated an entry for ${event.name}!%`
                ),
                eq(notification.eventId, event.id),
                eq(notification.userId, admin.id)
              )
            )

          await tx.insert(notification).values({
            userId: admin.id,
            body: `${ctx.session.user.name} has updated an entry for ${event.name}!`,
            url: `/${event.slug}`,
            eventId: event.id,
            createdAt: now,
            icon: 'material-symbols:contract-edit',
          })
        }

        return tx.query.eventEntry.findFirst({
          where: (eventEntry, { eq }) => eq(eventEntry.id, Number(input.id)),
        })
      })
    }),
  getEventEntries: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, input),
        with: {
          entries: {
            with: { user: { columns: { id: true, name: true, image: true } } },
          },
        },
      })
    }),
  getEventsVisible: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.event.findMany({
      where: (event, { eq }) => eq(event.visible, true),
      orderBy: (event, { desc }) => [desc(event.startDate)],
    })
  }),
  getEntriesForStandings: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.user.findMany({
      columns: { id: true, name: true, image: true },
      with: {
        entries: { with: { event: true } },
      },
    })
  }),
  getEventEntry: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => {
      return ctx.db.query.eventEntry.findFirst({
        where: (eventEntry, { eq }) => eq(eventEntry.id, input),
        with: {
          user: { columns: { id: true, name: true, image: true } },
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
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { eq }) => eq(event.id, Number(input.id)),
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
