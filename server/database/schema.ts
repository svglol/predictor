/* eslint-disable ts/no-use-before-define */
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const user = sqliteTable(
  'User',
  {
    id: text('id', { length: 191 }).notNull(),
    name: text('name', { length: 191 }).unique(),
    email: text('email', { length: 191 }),
    emailVerified: integer('emailVerified', { mode: 'timestamp' }),
    image: text('image'),
    role: text('role', { length: 191 }).default('USER').notNull(),
  },
  (table) => {
    return {
      userId: primaryKey({ columns: [table.id], name: 'User_id' }),
      userEmailKey: unique('User_email_key').on(table.email),
    }
  },
)

export const userRelation = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  entries: many(eventEntry),
  notifications: many(notification),
}))

export const account = sqliteTable(
  'Account',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('userId', { length: 191 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type', { length: 191 }).notNull(),
    provider: text('provider', { length: 191 }).notNull(),
    providerAccountId: text('providerAccountId', { length: 191 }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type', { length: 191 }),
    scope: text('scope', { length: 191 }),
    idToken: text('id_token'),
    sessionState: text('session_state', { length: 191 }),
  },
  (table) => {
    return {
      accountId: primaryKey({ columns: [table.id], name: 'Account_id' }),
      accountUserIdIdx: index('Account_userId_idx').on(table.userId),
      accountProviderIdKey: unique('Account_provider_providerAccountId_key').on(
        table.provider,
        table.providerAccountId,
      ),
    }
  },
)

export const accountRelation = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const session = sqliteTable(
  'Session',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    sessionToken: text('sessionToken', { length: 191 }).notNull(),
    userId: text('userId', { length: 191 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  (table) => {
    return {
      sessionId: primaryKey({ columns: [table.id], name: 'Session_id' }),
      sessionToken_sessionToken_key: unique('Session_sessionToken_key').on(
        table.sessionToken,
      ),
      sessionUserIdIdx: index('Session_userId_idx').on(table.userId),
    }
  },
)

export const sessionRelation = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const verificationToken = sqliteTable(
  'VerificationToken',
  {
    identifier: text('identifier', { length: 191 }).notNull(),
    token: text('token', { length: 191 }).notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    verificationToken_token_key: unique('VerificationToken_token_key').on(
      table.token,
    ),
    verificationToken_identifier_token_key: unique(
      'VerificationToken_identifier_token_key',
    ).on(table.identifier, table.token),
  }),
)

export const event = sqliteTable('Event', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  slug: text('slug', { length: 191 }).unique(),
  name: text('name', { length: 191 }),
  description: text('description', { length: 191 }),
  startDate: integer('event_start_date', { mode: 'timestamp' }),
  endDate: integer('event_end_date', { mode: 'timestamp' }),
  closeDate: integer('predictions_close_date', {
    mode: 'timestamp',
  }),
  status: text('status', {
    enum: ['DRAFT', 'PUBLISHED', 'DELETED', 'FINISHED'],
  })
    .notNull()
    .default('DRAFT'),
  information: text('information'),
  image: text('image'),
})

export const eventRelations = relations(event, ({ many }) => ({
  entries: many(eventEntry),
  sections: many(eventSection),
  optionSets: many(optionSet),
}))

export const eventEntry = sqliteTable(
  'EventEntry',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    eventId: integer('eventId')
      .notNull()
      .references(() => event.id),
    userId: text('userId', { length: 191 })
      .notNull()
      .references(() => user.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    totalScore: real('total_score').notNull().default(0),
    rank: integer('rank').default(0).notNull(),
  },
  (table) => {
    return {
      eventIdIdx: index('EventEntry_eventId_idx').on(table.eventId),
      userIdIdx: index('EventEntry_userId_idx').on(table.userId),
    }
  },
)

export const eventEntryRelations = relations(eventEntry, ({ one, many }) => ({
  user: one(user, {
    fields: [eventEntry.userId],
    references: [user.id],
  }),
  event: one(event, {
    fields: [eventEntry.eventId],
    references: [event.id],
  }),
  entrySections: many(eventEntrySection),
}))

export const eventEntryQuestion = sqliteTable(
  'EventEntryQuestion',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    eventEntrySectionId: integer('eventEntrySectionId')
      .notNull()
      .references(() => eventEntrySection.id),
    entryString: text('entryString', { length: 191 }),
    entryBoolean: integer('entryBoolean', { mode: 'boolean' }),
    entryNumber: real('entryNumber'),
    entryOptionId: integer('entryOptionId'),
    questionId: integer('questionId')
      .notNull()
      .references(() => question.id),
    questionScore: real('question_score').notNull().default(0),
  },
  (table) => {
    return {
      entryOptionIdIdx: index('EventEntryQuestion_entryOptionId_idx').on(
        table.entryOptionId,
      ),
      eventEntrySectionIdIdx: index(
        'EventEntryQuestion_eventEntrySectionId_idx',
      ).on(table.eventEntrySectionId),
      questionIdIdx: index('EventEntryQuestion_questionId_idx').on(
        table.questionId,
      ),
    }
  },
)

export const eventEntryQuestionRelations = relations(
  eventEntryQuestion,
  ({ one }) => ({
    eventEntrySection: one(eventEntrySection, {
      fields: [eventEntryQuestion.eventEntrySectionId],
      references: [eventEntrySection.id],
    }),
    question: one(question, {
      fields: [eventEntryQuestion.questionId],
      references: [question.id],
    }),
    entryOption: one(option, {
      fields: [eventEntryQuestion.entryOptionId],
      references: [option.id],
    }),
  }),
)

export const eventEntrySection = sqliteTable(
  'EventEntrySection',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    sectionId: integer('sectionId')
      .notNull()
      .references(() => eventSection.id),
    eventEntryId: integer('eventEntryId')
      .notNull()
      .references(() => eventEntry.id),
    sectionScore: real('section_score').notNull().default(0),
  },
  (table) => {
    return {
      eventEntryIdIdx: index('EventEntrySection_eventEntryId_idx').on(
        table.eventEntryId,
      ),
      sectionIdIdx: index('EventEntrySection_sectionId_idx').on(
        table.sectionId,
      ),
    }
  },
)

export const eventEntrySectionRelations = relations(
  eventEntrySection,
  ({ one, many }) => ({
    eventEntry: one(eventEntry, {
      fields: [eventEntrySection.eventEntryId],
      references: [eventEntry.id],
    }),
    section: one(eventSection, {
      fields: [eventEntrySection.sectionId],
      references: [eventSection.id],
    }),
    entryQuestions: many(eventEntryQuestion),
  }),
)

export const eventSection = sqliteTable(
  'EventSection',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    eventId: integer('eventId')
      .notNull()
      .references(() => event.id),
    heading: text('heading', { length: 191 }),
    description: text('description', { length: 191 }),
    order: integer('order').notNull(),
  },
  (table) => {
    return {
      eventIdIdx: index('EventSection_eventId_idx').on(table.eventId),
    }
  },
)

export const eventSectionRelations = relations(
  eventSection,
  ({ one, many }) => ({
    event: one(event, {
      fields: [eventSection.eventId],
      references: [event.id],
    }),
    questions: many(question),
  }),
)

export const option = sqliteTable(
  'Option',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title', { length: 191 }).notNull(),
    optionSetId: integer('optionSetId')
      .notNull()
      .references(() => optionSet.id),
    order: integer('order').notNull(),
  },
  (table) => {
    return {
      optionSetIdIdx: index('Option_optionSetId_idx').on(table.optionSetId),
    }
  },
)

export const optionRelations = relations(option, ({ one }) => ({
  optionSet: one(optionSet, {
    fields: [option.optionSetId],
    references: [optionSet.id],
  }),
}))

export const optionSet = sqliteTable(
  'OptionSet',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title', { length: 191 }),
    eventId: integer('eventId').references(() => event.id),
  },
  (table) => {
    return {
      eventIdIdx: index('OptionSet_eventId_idx').on(table.eventId),
    }
  },
)

export const optionSetRelations = relations(optionSet, ({ many, one }) => ({
  options: many(option),
  event: one(event, {
    fields: [optionSet.eventId],
    references: [event.id],
  }),
}))

export const question = sqliteTable(
  'Question',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    type: text('type', {
      enum: ['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN'],
    }),
    question: text('question', { length: 191 }),
    optionSetId: integer('optionSetId').references(() => optionSet.id),
    eventSectionId: integer('eventSectionId')
      .notNull()
      .references(() => eventSection.id),
    order: integer('order').notNull(),
    points: real('points').default(1).notNull(),
    resultString: text('resultString', { length: 191 }),
    resultBoolean: integer('resultBoolean', { mode: 'boolean' }),
    resultNumber: real('resultNumber'),
    optionId: integer('optionId').references(() => option.id),
    hint: text('hint', { length: 191 }),
  },
  (table) => {
    return {
      eventSectionIdIdx: index('Question_eventSectionId_idx').on(
        table.eventSectionId,
      ),
      optionIdIdx: index('Question_optionId_idx').on(table.optionId),
      optionSetIdIdx: index('Question_optionSetId_idx').on(table.optionSetId),
    }
  },
)

export const questionRelations = relations(question, ({ one }) => ({
  resultOption: one(option, {
    fields: [question.optionId],
    references: [option.id],
  }),
  optionSet: one(optionSet, {
    fields: [question.optionSetId],
    references: [optionSet.id],
  }),
  eventSection: one(eventSection, {
    fields: [question.eventSectionId],
    references: [eventSection.id],
  }),
}))

export const notification = sqliteTable('Notification', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('userId', { length: 191 })
    .notNull()
    .references(() => user.id),
  body: text('body', { length: 191 }).notNull(),
  icon: text('icon', { length: 191 }),
  url: text('url', { length: 191 }).notNull(),
  read: integer('read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  eventId: integer('eventId').references(() => event.id),
})

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  event: one(event, {
    fields: [notification.eventId],
    references: [event.id],
  }),
}))
