import type { InferSelectModel } from 'drizzle-orm'

declare global {
  interface FormResponse {
    eventId: number
    userId: string
    entrySections: FormSection[]
  }
  interface FormSection {
    id: number
    entryQuestions: FormQuestion[]
  }
  interface FormQuestion {
    id: number
    entryQuestionId?: number
    sectionId: number
    answerString?: string
    answerBoolean?: boolean
    answerNumber?: number
    answerOption?: number
    valid: string
  }

  type UserNotification = InferSelectModel<typeof tables.notification>

  type EventCard = InferSelectModel<typeof tables.event>

  type questionWithResult = InferSelectModel<typeof tables.question> & {
    resultOption?: InferSelectModel<typeof tables.option> | null
    optionSet?:
      | (InferSelectModel<typeof tables.optionSet> & {
        options: InferSelectModel<typeof tables.option>[]
      })
      | null
  }

  type SectionWithQuestionOptionSet = InferSelectModel<typeof tables.eventSection> & {
    questions: questionWithResult[]
  }

  type SectionWithQuestion = InferSelectModel<typeof tables.eventSection> & {
    questions: questionWithResult[]
  }

  type QuestionWithResultOption = InferSelectModel<typeof tables.question> & {
    resultOption?: InferSelectModel<typeof tables.option> | null
  }

  type Section = InferSelectModel<typeof tables.eventSection> & {
    questions: QuestionWithResultOption[]
  }

  type EventSectionWithQuestions = InferSelectModel<typeof tables.eventSection> & {
    questions: (InferSelectModel<typeof tables.question> & {
      resultOption: InferSelectModel<typeof tables.option> | null
      optionSet:
        | (InferSelectModel<typeof tables.optionSet> & {
          options: InferSelectModel<typeof tables.option>[]
        })
        | null
    })[]
  }

  type PublicUser = Omit<User, 'email' | 'emailVerified' | 'role'>

  type PredictorEvent =
    | (InferSelectModel<typeof tables.event> & {
      entries: (InferSelectModel<typeof tables.eventEntry> & {
        user: PublicUser
        entrySections: (InferSelectModel<typeof tables.eventEntrySection> & {
          entryQuestions: (InferSelectModel<typeof tables.eventEntryQuestion> & {
            question: InferSelectModel<typeof tables.question>
            entryOption?: InferSelectModel<typeof tables.option>
          })[]
        })[]
      })[]
      sections: (InferSelectModel<typeof tables.eventSection> & {
        questions: (InferSelectModel<typeof tables.question> & {
          resultOption?: InferSelectModel<typeof tables.option> | null
          optionSet?: InferSelectModel<typeof tables.optionSet> & {
            options: InferSelectModel<typeof tables.option>[]
          }
        })[]
      })[]
    })
    | null
    | undefined

  type EventEntryQuestion = InferSelectModel<typeof tables.eventEntryQuestion> & {
    question: InferSelectModel<typeof tables.question>
    entryOption?: InferSelectModel<typeof tables.option> | null
  }

  type EventEntryQuestionWithOptions = InferSelectModel<typeof tables.eventEntryQuestion> & {
    question: InferSelectModel<typeof tables.question> & {
      optionSet: InferSelectModel<typeof tables.optionSet> & {
        options: InferSelectModel<typeof tables.option>[]
      }
    }
    entryOption: InferSelectModel<typeof tables.option> | null
  }

  type Question = InferSelectModel<typeof tables.question>
  type EventSection = InferSelectModel<typeof tables.eventSection>
  type OptionSet = InferSelectModel<typeof tables.optionSet> & {
    options: InferSelectModel<typeof tables.option>[]
  }
  type Option = InferSelectModel<typeof tables.option>
  type User = InferSelectModel<typeof tables.user>
  type Account = InferSelectModel<typeof tables.account>

  type ImmutablePrimitive =
    | undefined
    | null
    | boolean
    | string
    | number
    // eslint-disable-next-line ts/no-unsafe-function-type
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

  interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget
  }
}

export {}
