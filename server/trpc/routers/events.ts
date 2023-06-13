import { z } from 'zod'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '~/server/db'

export const eventsRouter = createTRPCRouter({
  addEvent: adminProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.create({
        data: input,
      })
    }),
  getEvents: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany()
  }),
  getEvent: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUnique({
        where: {
          id: input,
        },
        include: {
          sections: {include: {questions: {orderBy: {order: 'asc'},include:{resultOption: true}}},orderBy: {order: 'asc'}}, 
        },
      })
    }),
    updateEvent: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string(),
      event_start_date: z.date().optional(),
      event_end_date: z.date().optional(),
      predictions_close_date: z.date().optional()
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
    deleteEvent: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.delete({
        where: {
          id: input,
        },
      })
    }),
    getOptionSets: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.optionSet.findMany({include: {
        options: true, 
      },});
    }),
    addOptionSet: adminProcedure.input(z.object({
      title: z.string(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.create({
        data: input,
      })
    }),
    getOptionSet: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.findUnique({
        where: {
          id: input,
        },include: {
          options: true, 
        },
      })
    }),
    deleteOptionSet: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.delete({
        where: {
          id: input,
        },
      })
    }),
    addOption: adminProcedure.input(z.object({
      title: z.string(),
      optionSetId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.create({
        data: input,
      })
    }),
    deleteOption: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.delete({
        where: {
          id: input,
        },
      })
    }),
    updateOptionSet: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.optionSet.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
    updateOption: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.option.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
    addSection: adminProcedure.input(z.object({
      eventId: z.number(),
      order: z.number(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.create({
        data: input,
        include: {questions: {include:{resultOption: true}}}
      })
    }),
    deleteSection: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.delete({
        where: {
          id: input,
        },
      })
    }),
    updateSection: adminProcedure.input(z.object({
      id: z.number(),
      heading: z.string(),
      description: z.string(),
      order: z.number(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.eventSection.update({
        where: {
          id: input.id,
        },
        data: input,
      })      
    }),
    addQuestion: adminProcedure.input(z.object({
      eventSectionId: z.number(),
      order: z.number(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.create({
        data: input,
      })
    }),
    updateQuestion: adminProcedure.input(z.object({
      id: z.number(),
      question: z.string(),
      type:z.enum(['MULTI', 'TIME', 'NUMBER','TEXT','BOOLEAN']),
      optionSetId: z.number().optional(),
      order: z.number(),
      points: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: input,
      })
    }),
    deleteQuestion: adminProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      return ctx.prisma.question.delete({
        where: {
          id: input,
        },
      })
    }),
})