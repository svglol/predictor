export default defineEventHandler(async () => {
  return useDB().query.event.findFirst({
    where: (event, { ne, and, eq }) =>
      and(
        eq(event.slug, '2024-formula-1-chinese-gp'),
        ne(event.status, 'DELETED'),
        ne(event.status, 'DRAFT'),
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
})
