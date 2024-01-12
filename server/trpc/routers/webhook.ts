import { z } from 'zod'
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  adminOnlyProcedure,
} from '../trpc'
import { TRPCError } from '@trpc/server'
/* eslint-enable @typescript-eslint/no-unused-vars */
export const webhookRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input }) => {
      const config = useRuntimeConfig()
      //@ts-ignore
      return await $fetch(config.discordWebhook, {
        method: 'post',
        body: { content: input.content },
      })
    }),
})
