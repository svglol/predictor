export default defineEventHandler(async () => {
  const events = await useDB().query.event.findMany({
    where: (event, { ne, and }) =>
      and(ne(event.status, 'DELETED'), ne(event.status, 'DRAFT')),
    columns: { slug: true },
  })
  const users = await useDB().query.user.findMany({
    columns: { name: true },
  })
  return users
    .map(user => ({ loc: `/user/${user.name}`, _sitemap: 'pages' }))
    .concat(
      events.map(event => ({ loc: `/event/${event.slug}`, _sitemap: 'pages' })),
    )
})
