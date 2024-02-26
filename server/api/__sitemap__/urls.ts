import { db } from '~/server/db/db'

export default defineEventHandler(async () => {
  const events = await db.query.event.findMany({
    where: (event, { ne, and }) =>
      and(ne(event.status, 'DELETED'), ne(event.status, 'DRAFT')),
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
