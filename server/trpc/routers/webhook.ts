import { z } from 'zod'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  adminOnlyProcedure,
} from '../trpc'
/* eslint-enable @typescript-eslint/no-unused-vars */
export const webhookRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        url: z.string().optional(),
        thumbnail: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const config = useRuntimeConfig()
      if (input.title || input.description || input.imageUrl || input.url) {
        // @ts-ignore
        return await $fetch(config.discordWebhook, {
          method: 'post',
          body: {
            content: input.content,
            embeds: [
              {
                title: input.title,
                description: input.description,
                image: {
                  url: input.imageUrl,
                },
                url: input.url,
                thumbnail: {
                  url: input.thumbnail,
                },
                timestamp: new Date().toISOString(),
                color: 0x04ade80,
              },
            ],
          },
        })
      } else {
        // @ts-ignore
        return await $fetch(config.discordWebhook, {
          method: 'post',
          body: {
            content: input.content,
          },
        })
      }
    }),
})
