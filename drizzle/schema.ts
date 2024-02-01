import {
  mysqlTable,
  index,
  primaryKey,
  unique,
  int,
  varchar,
  text,
  datetime,
  longtext,
  double,
  mysqlEnum,
  boolean,
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'

export const user = mysqlTable(
  'User',
  {
    id: varchar('id', { length: 191 }).notNull(),
    name: varchar('name', { length: 191 }),
    email: varchar('email', { length: 191 }),
    emailVerified: datetime('emailVerified', { mode: 'date', fsp: 3 }),
    image: longtext('image'),
    role: varchar('role', { length: 191 }).default('USER').notNull(),
  },
  table => {
    return {
      userId: primaryKey({ columns: [table.id], name: 'User_id' }),
      userIdKey: unique('User_id_key').on(table.id),
      userEmailKey: unique('User_email_key').on(table.email),
    }
  }
)

export const userRelation = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  entries: many(eventEntry),
}))

export const account = mysqlTable(
  'Account',
  {
    id: int('id').autoincrement().notNull().primaryKey(),
    userId: varchar('userId', { length: 191 }).notNull(),
    type: varchar('type', { length: 191 }).notNull(),
    provider: varchar('provider', { length: 191 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 191 }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: int('expires_at'),
    tokenType: varchar('token_type', { length: 191 }),
    scope: varchar('scope', { length: 191 }),
    idToken: text('id_token'),
    sessionState: varchar('session_state', { length: 191 }),
  },
  table => {
    return {
      accountId: primaryKey({ columns: [table.id], name: 'Account_id' }),
      accountIdKey: unique('Account_id_key').on(table.id),
      accountUserIdIdx: index('Account_userId_idx').on(table.userId),
      accountProviderIdKey: unique('Account_provider_providerAccountId_key').on(
        table.provider,
        table.providerAccountId
      ),
    }
  }
)

export const accountRelation = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const session = mysqlTable(
  'Session',
  {
    id: int('id').autoincrement().notNull().primaryKey(),
    sessionToken: varchar('sessionToken', { length: 191 }).notNull(),
    userId: varchar('userId', { length: 191 }).notNull(),
    expires: datetime('expires', { mode: 'date', fsp: 3 }).notNull(),
  },
  table => {
    return {
      sessionId: primaryKey({ columns: [table.id], name: 'Session_id' }),
      sessionIdKey: unique('Session_id_key').on(table.id),
      sessionToken_sessionToken_key: unique('Session_sessionToken_key').on(
        table.sessionToken
      ),
      sessionUserIdIdx: index('Session_userId_idx').on(table.userId),
    }
  }
)

export const sessionRelation = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const verificationToken = mysqlTable(
  'VerificationToken',
  {
    identifier: varchar('identifier', { length: 191 }).notNull(),
    token: varchar('token', { length: 191 }).notNull(),
    expires: datetime('expires', { mode: 'date', fsp: 3 }).notNull(),
  },
  table => ({
    verificationToken_token_key: unique('VerificationToken_token_key').on(
      table.token
    ),
    verificationToken_identifier_token_key: unique(
      'VerificationToken_identifier_token_key'
    ).on(table.identifier, table.token),
  })
)

export const event = mysqlTable(
  'Event',
  {
    id: int('id').autoincrement().notNull(),
    slug: varchar('slug', { length: 191 }).unique(),
    name: varchar('name', { length: 191 }),
    description: varchar('description', { length: 191 }),
    startDate: datetime('event_start_date', { mode: 'date', fsp: 3 }),
    endDate: datetime('event_end_date', { mode: 'date', fsp: 3 }),
    closeDate: datetime('predictions_close_date', {
      mode: 'date',
      fsp: 3,
    }),
    inviteId: varchar('inviteId', { length: 191 }).notNull(),
    visible: boolean('visible').default(false).notNull(),
    information: longtext('information'),
    image: longtext('image'),
  },
  table => {
    return {
      eventId: primaryKey({ columns: [table.id], name: 'Event_id' }),
      eventIdKey: unique('Event_id_key').on(table.id),
      eventInviteIdKey: unique('Event_inviteId_key').on(table.inviteId),
    }
  }
)

export const eventRelations = relations(event, ({ many }) => ({
  entries: many(eventEntry),
  sections: many(eventSection),
  optionSets: many(optionSet),
}))

export const eventEntry = mysqlTable(
  'EventEntry',
  {
    id: int('id').autoincrement().notNull(),
    eventId: int('eventId').notNull(),
    userId: varchar('userId', { length: 191 }).notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    totalScore: double('total_score').notNull().default(0),
    rank: int('rank').default(0).notNull(),
  },
  table => {
    return {
      eventIdIdx: index('EventEntry_eventId_idx').on(table.eventId),
      userIdIdx: index('EventEntry_userId_idx').on(table.userId),
      eventEntryId: primaryKey({ columns: [table.id], name: 'EventEntry_id' }),
      eventEntryIdKey: unique('EventEntry_id_key').on(table.id),
    }
  }
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
  scoreHistory: many(entryScore),
}))

export const entryScore = mysqlTable(
  'EntryScore',
  {
    entryId: int('entryId').notNull(),
    score: double('score').notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  table => {
    return {
      entryScoreKey: primaryKey({
        columns: [table.entryId, table.createdAt],
        name: 'EntryScore_key',
      }),
      EntryScoreEntryIdIdx: index('EntryScore_entryScoreEntryId_idx').on(
        table.entryId
      ),
    }
  }
)

export const eventEntryQuestion = mysqlTable(
  'EventEntryQuestion',
  {
    id: int('id').autoincrement().notNull(),
    eventEntrySectionId: int('eventEntrySectionId').notNull(),
    entryString: varchar('entryString', { length: 191 }),
    entryBoolean: boolean('entryBoolean'),
    entryNumber: double('entryNumber'),
    entryOptionId: int('entryOptionId'),
    questionId: int('questionId').notNull(),
    questionScore: double('question_score').notNull().default(0),
  },
  table => {
    return {
      entryOptionIdIdx: index('EventEntryQuestion_entryOptionId_idx').on(
        table.entryOptionId
      ),
      eventEntrySectionIdIdx: index(
        'EventEntryQuestion_eventEntrySectionId_idx'
      ).on(table.eventEntrySectionId),
      questionIdIdx: index('EventEntryQuestion_questionId_idx').on(
        table.questionId
      ),
      eventEntryQuestionId: primaryKey({
        columns: [table.id],
        name: 'EventEntryQuestion_id',
      }),
      eventEntryQuestionIdKey: unique('EventEntryQuestion_id_key').on(table.id),
    }
  }
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
  })
)

export const eventEntrySection = mysqlTable(
  'EventEntrySection',
  {
    id: int('id').autoincrement().notNull(),
    sectionId: int('sectionId').notNull(),
    eventEntryId: int('eventEntryId').notNull(),
    sectionScore: double('section_score').notNull().default(0),
  },
  table => {
    return {
      eventEntryIdIdx: index('EventEntrySection_eventEntryId_idx').on(
        table.eventEntryId
      ),
      sectionIdIdx: index('EventEntrySection_sectionId_idx').on(
        table.sectionId
      ),
      eventEntrySectionId: primaryKey({
        columns: [table.id],
        name: 'EventEntrySection_id',
      }),
      eventEntrySectionIdKey: unique('EventEntrySection_id_key').on(table.id),
    }
  }
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
  })
)

export const eventSection = mysqlTable(
  'EventSection',
  {
    id: int('id').autoincrement().notNull(),
    eventId: int('eventId').notNull(),
    heading: varchar('heading', { length: 191 }),
    description: varchar('description', { length: 191 }),
    order: int('order').notNull(),
  },
  table => {
    return {
      eventIdIdx: index('EventSection_eventId_idx').on(table.eventId),
      eventSectionId: primaryKey({
        columns: [table.id],
        name: 'EventSection_id',
      }),
      eventSectionIdKey: unique('EventSection_id_key').on(table.id),
    }
  }
)

export const eventSectionRelations = relations(
  eventSection,
  ({ one, many }) => ({
    event: one(event, {
      fields: [eventSection.eventId],
      references: [event.id],
    }),
    questions: many(question),
  })
)

export const option = mysqlTable(
  'Option',
  {
    id: int('id').autoincrement().notNull(),
    title: varchar('title', { length: 191 }).notNull(),
    optionSetId: int('optionSetId').notNull(),
    order: int('order').notNull(),
  },
  table => {
    return {
      optionSetIdIdx: index('Option_optionSetId_idx').on(table.optionSetId),
      optionId: primaryKey({ columns: [table.id], name: 'Option_id' }),
      optionIdKey: unique('Option_id_key').on(table.id),
    }
  }
)

export const optionRelations = relations(option, ({ one }) => ({
  optionSet: one(optionSet, {
    fields: [option.optionSetId],
    references: [optionSet.id],
  }),
}))

export const optionSet = mysqlTable(
  'OptionSet',
  {
    id: int('id').autoincrement().notNull(),
    title: varchar('title', { length: 191 }),
    eventId: int('eventId'),
  },
  table => {
    return {
      eventIdIdx: index('OptionSet_eventId_idx').on(table.eventId),
      optionSetId: primaryKey({ columns: [table.id], name: 'OptionSet_id' }),
      optionSetIdKey: unique('OptionSet_id_key').on(table.id),
    }
  }
)

export const optionSetRelations = relations(optionSet, ({ many, one }) => ({
  options: many(option),
  event: one(event, {
    fields: [optionSet.eventId],
    references: [event.id],
  }),
}))

export const question = mysqlTable(
  'Question',
  {
    id: int('id').autoincrement().notNull(),
    type: mysqlEnum('type', ['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN']),
    question: varchar('question', { length: 191 }),
    optionSetId: int('optionSetId'),
    eventSectionId: int('eventSectionId').notNull(),
    order: int('order').notNull(),
    points: double('points').default(1).notNull(),
    resultString: varchar('resultString', { length: 191 }),
    resultBoolean: boolean('resultBoolean'),
    resultNumber: double('resultNumber'),
    optionId: int('optionId'),
    hint: varchar('hint', { length: 191 }),
  },
  table => {
    return {
      eventSectionIdIdx: index('Question_eventSectionId_idx').on(
        table.eventSectionId
      ),
      optionIdIdx: index('Question_optionId_idx').on(table.optionId),
      optionSetIdIdx: index('Question_optionSetId_idx').on(table.optionSetId),
      questionId: primaryKey({ columns: [table.id], name: 'Question_id' }),
      questionIdKey: unique('Question_id_key').on(table.id),
    }
  }
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
