import { z } from 'zod'
export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')
  const parsedSlug = z.string().parse(slug)
  return db.query.event.findFirst({
    where: (event, { eq }) => eq(event.slug, parsedSlug),
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
})
