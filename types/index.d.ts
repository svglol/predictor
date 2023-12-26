import { Prisma } from '@prisma/client'
declare global {
  interface FormResponse {
    eventId: number
    userId: number
    entrySections: FormSection[]
  }
  interface FormSection {
    id: number
    entryQuestions: FormQuestion[]
  }
  interface FormQuestion {
    id: number
    sectionId: number
    answerString?: string
    answerBoolean?: boolean
    answerNumber?: number
    answerOption?: number
    valid: boolean
  }

  const questionWithResult = Prisma.validator<Prisma.QuestionArgs>()({
    include: { resultOption: true, optionSet: { include: { options: true } } },
  })
  type questionWithResult = Prisma.QuestionGetPayload<typeof questionWithResult>

  const sectionWithQuestion = Prisma.validator<Prisma.EventSectionArgs>()({
    include: {
      questions: {
        include: {
          resultOption: true,
          optionSet: { include: { options: true } },
        },
      },
    },
  })
  type SectionWithQuestionOptionSet = Prisma.EventSectionGetPayload<
    typeof sectionWithQuestion
  >

  const sectionWithQuestion = Prisma.validator<Prisma.EventSectionArgs>()({
    include: { questions: { include: { resultOption: true } } },
  })
  type SectionWithQuestion = Prisma.EventSectionGetPayload<
    typeof sectionWithQuestion
  >

  const questionWithResultOption = Prisma.validator<Prisma.QuestionArgs>()({
    include: { resultOption: true },
  })
  type QuestionWithResultOption = Prisma.QuestionGetPayload<
    typeof questionWithResultOption
  >

  const questionWithResultOption = Prisma.validator<Prisma.QuestionArgs>()({
    include: { resultOption: true },
  })
  type QuestionWithResultOption = Prisma.QuestionGetPayload<
    typeof questionWithResultOption
  >

  const questionWithResultOption = Prisma.validator<Prisma.QuestionArgs>()({
    include: { resultOption: true, optionSet: { include: { options: true } } },
  })
  type QuestionWithResultOptionSet = Prisma.QuestionGetPayload<
    typeof questionWithResultOption
  >

  const eventWithQuestion = Prisma.validator<Prisma.EventSectionArgs>()({
    include: {
      questions: { include: { resultOption: true, resultOption: true } },
    },
  })
  type EventWithQuestion = Prisma.EventSectionGetPayload<
    typeof eventWithQuestion
  >

  // good ones
  const section = Prisma.validator<Prisma.EventSectionArgs>()({
    include: {
      questions: {
        include: {
          resultOption: true,
          optionSet: { include: { options: true } },
        },
      },
    },
  })
  type Section = Prisma.EventSectionGetPayload<typeof section>

  const question = Prisma.validator<Prisma.QuestionArgs>()({
    include: { resultOption: true, optionSet: { include: { options: true } } },
  })

  type Question = Prisma.QuestionGetPayload<typeof question>

  const event = Prisma.validator<Prisma.EventArgs>()({
    include: {
      entries: {
        include: {
          user: true,
          entrySections: {
            include: {
              entryQuestions: {
                include: { question: true, entryOption: true },
              },
            },
          },
        },
      },
      sections: {
        include: {
          questions: {
            include: {
              resultOption: true,
              optionSet: { include: { options: true } },
            },
          },
        },
      },
    },
  })
  type PredictorEvent = Prisma.EventGetPayload<typeof event>

  const eventCard = Prisma.validator<Prisma.EventArgs>()({})
  type EventCard = Prisma.EventGetPayload<typeof eventCard>

  const eventEntryQuestion = Prisma.validator<Prisma.EventEntryQuestionArgs>()({
    include: {
      question: true,
      entryOption: true,
    },
  })

  type EventEntryQuestion = Prisma.EventEntryQuestionGetPayload<
    typeof eventEntryQuestion
  >

  const eventEntrySection = Prisma.validator<Prisma.EventEntrySectionArgs>()({
    include: {
      entryQuestions: {
        include: { question: true, entryOption: true },
      },
    },
  })

  type EventEntrySection = Prisma.EventEntrySectionGetPayload<
    typeof eventEntrySection
  >

  type ImmutablePrimitive =
    | undefined
    | null
    | boolean
    | string
    | number
    | Function

  export type Immutable<T> = T extends ImmutablePrimitive
    ? T
    : T extends Array<infer U>
    ? ImmutableArray<U>
    : T extends Map<infer K, infer V>
    ? ImmutableMap<K, V>
    : T extends Set<infer M>
    ? ImmutableSet<M>
    : ImmutableObject<T>

  export type ImmutableArray<T> = ReadonlyArray<Immutable<T>>
  export type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>
  export type ImmutableSet<T> = ReadonlySet<Immutable<T>>
  export type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> }
}

export {}
