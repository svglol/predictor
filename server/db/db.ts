import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { Client } from '@planetscale/database'
import * as schema from './schema'
// create the connection
const client = new Client({
  url: process.env.DATABASE_URL,
})
export const db = drizzle(client, { schema })
