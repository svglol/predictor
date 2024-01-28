import { Client } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fetch as undiciFetch } from 'undici'
import * as schema from '../drizzle/schema'

dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`

const client = new Client({ url: connectionString, fetch: undiciFetch })
const adapter = new PrismaPlanetScale(client)
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { connect } from '@planetscale/database'
// create the connection
const connection = connect({
  url: process.env.DATABASE_URL,
})
export const db = drizzle(connection, { schema })
