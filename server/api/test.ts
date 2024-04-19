export default defineEventHandler(async () => {
  return useDB().query.event.findFirst({
    where: (event, { eq }) => eq(event.slug, '2024-formula-1-chinese-gp'),
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
})
