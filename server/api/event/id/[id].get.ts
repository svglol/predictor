import { z } from 'zod'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')
  const parsedId = z.number().parse(Number(id))
  return db.query.event.findFirst({
    where: (event, { eq }) => eq(event.id, parsedId),
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
})
