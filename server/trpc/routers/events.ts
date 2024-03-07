import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, eq, like, or } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const eventsRouter = createTRPCRouter({
  getEventWithSlug: publicProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findFirst({
        where: (event, { ne, and, eq }) =>
          and(
            eq(event.slug, input),
            ne(event.status, 'DELETED'),
            ne(event.status, 'DRAFT')
          ),
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
        where: (event, { ne, and, eq }) =>
          and(
            eq(event.id, input),
            ne(event.status, 'DELETED'),
            ne(event.status, 'DRAFT')
          ),
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
        .select()
        .from(tables.eventEntry)
        .where(
          and(
            eq(tables.eventEntry.userId, ctx.session.user.id),
            eq(tables.eventEntry.eventId, input.eventId)
          )
        )
      if (numEntriesUser.length > 0) {
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

      // create event entry
      const createdEventEntry = await ctx.db
        .insert(tables.eventEntry)
        .values({
          eventId: input.eventId,
          userId: ctx.session.user.id,
        })
        .returning()

      const eventEntryId = Number(createdEventEntry.pop()?.id ?? 0)
      const entryQuestionValues = [] as {
        eventEntrySectionId: number
        questionId: number
        entryString?: string | null
        entryBoolean?: boolean | null
        entryNumber?: number | null
        entryOptionId?: number | null
      }[]

      for (const entrySection of input.entrySections) {
        const createdEntrySection = await ctx.db
          .insert(tables.eventEntrySection)
          .values({
            eventEntryId,
            sectionId: entrySection.sectionId,
          })
          .returning()
        const eventEntrySectionId = Number(createdEntrySection.pop()?.id ?? 0)

        for (const question of entrySection.entryQuestions) {
          entryQuestionValues.push({
            eventEntrySectionId,
            questionId: question.questionId,
            entryString: question.entryString,
            entryBoolean: question.entryBoolean,
            entryNumber: question.entryNumber,
            entryOptionId: question.entryOptionId,
          })
        }
      }

      await ctx.db.insert(tables.eventEntryQuestion).values(entryQuestionValues)

      // send notification to admins
      const admins = await ctx.db.query.user.findMany({
        where: or(
          eq(tables.user.role, 'ADMIN'),
          eq(tables.user.role, 'EDITOR')
        ),
        columns: { id: true },
      })
      const notificationOperations = admins.map(admin => {
        return ctx.db.insert(tables.notification).values({
          userId: admin.id,
          body: `${ctx.session.user.name} has submitted an entry for ${event.name}!`,
          url: `/${event.slug}`,
          eventId: event.id,
          createdAt: now,
          icon: 'material-symbols:contract-edit',
        })
      })
      if (isTuple(notificationOperations)) {
        await ctx.db.batch(notificationOperations)
      }

      const config = useRuntimeConfig()
      const entryUser = await ctx.db.query.user.findFirst({
        where: (user, { eq }) =>
          eq(user.id, createdEventEntry.pop()?.userId ?? ''),
      })
      await $fetch(config.discordWebhook, {
        method: 'post',
        body: {
          embeds: [
            {
              title: event.name,
              description: `## 📝 ***New entry from ${entryUser?.name}***`,
              url: `${useRuntimeConfig().public.authJs.baseUrl}/${event.slug}`,
              thumbnail: {
                url: entryUser?.image,
              },
              timestamp: new Date().toISOString(),
              color: 0x00ea5e9,
            },
          ],
        },
      })

      return createdEventEntry
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

      // update event entry
      const updatedQuestionsOperations = input.updatedQuestions.map(
        question => {
          return ctx.db
            .update(tables.eventEntryQuestion)
            .set({
              entryString: question.entryString,
              entryBoolean: question.entryBoolean,
              entryNumber: question.entryNumber,
              entryOptionId: question.entryOptionId,
            })
            .where(eq(tables.eventEntryQuestion.id, question.id))
        }
      )
      await ctx.db.batch([
        ctx.db
          .update(tables.eventEntry)
          .set({ updatedAt: new Date() })
          .where(eq(tables.eventEntry.id, input.id)),
        ...updatedQuestionsOperations,
      ])

      // send notification to admins
      const admins = await ctx.db.query.user.findMany({
        where: or(
          eq(tables.user.role, 'ADMIN'),
          eq(tables.user.role, 'EDITOR')
        ),
        columns: { id: true },
      })
      const noficationOperations = admins.map(admin => {
        return ctx.db.insert(tables.notification).values({
          userId: admin.id,
          body: `${ctx.session.user.name} has updated an entry for ${event.name}!`,
          url: `/${event.slug}`,
          eventId: event.id,
          createdAt: now,
          icon: 'material-symbols:contract-edit',
        })
      })

      const notficationUpdateOperations = admins.map(admin => {
        return ctx.db
          .update(tables.notification)
          .set({ read: true })
          .where(
            and(
              like(
                tables.notification.body,
                `%${ctx.session.user.name} has updated an entry for ${event.name}!%`
              ),
              eq(tables.notification.eventId, event.id),
              eq(tables.notification.userId, admin.id)
            )
          )
      })

      if (
        isTuple(noficationOperations) &&
        isTuple(notficationUpdateOperations)
      ) {
        useDB().batch([...noficationOperations, ...notficationUpdateOperations])
      }

      const updatedEventEntry = await ctx.db.query.eventEntry.findFirst({
        where: (eventEntry, { eq }) => eq(eventEntry.id, Number(input.id)),
      })

      const config = useRuntimeConfig()
      const entryUser = await ctx.db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, updatedEventEntry?.userId ?? ''),
      })
      await $fetch(config.discordWebhook, {
        method: 'post',
        body: {
          embeds: [
            {
              title: event.name,
              description: `## 📝 ***Updated entry from ${entryUser?.name}***`,
              url: `${useRuntimeConfig().public.authJs.baseUrl}/${event.slug}`,
              thumbnail: {
                url: entryUser?.image,
              },
              timestamp: new Date().toISOString(),
              color: 0x00ea5e9,
            },
          ],
        },
      })
      return updatedEventEntry
    }),
  getEventsVisible: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.event.findMany({
      where: (event, { ne, and }) =>
        and(ne(event.status, 'DELETED'), ne(event.status, 'DRAFT')),
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
})
