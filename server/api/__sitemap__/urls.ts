export default defineEventHandler(async () => {
  const events = await db.query.event.findMany({
    columns: { slug: true },
  })
  const users = await db.query.user.findMany({
    columns: { name: true },
  })
  return users
    .map(user => ({ loc: `/user/${user.name}`, _sitemap: 'pages' }))
    .concat(
      events.map(event => ({ loc: `/event/${event.slug}`, _sitemap: 'pages' }))
    )
})
