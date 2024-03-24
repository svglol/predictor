import { z } from 'zod'
import {
  adminProcedure,
  createTRPCRouter,
} from '../trpc'

export const webhookRouter = createTRPCRouter({
  sendMessage: adminProcedure
    .input(
      z.object({
        content: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        url: z.string().optional(),
        thumbnail: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const config = useRuntimeConfig()
      if (input.title || input.description || input.imageUrl || input.url) {
        // @ts-expect-error excessive stack depth
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
                color: 0x00EA5E9,
              },
            ],
          },
        })
      }
      else {
        return await $fetch(config.discordWebhook, {
          method: 'post',
          body: {
            content: input.content,
          },
        })
      }
    }),
})
