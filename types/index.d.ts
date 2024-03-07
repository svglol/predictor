import {
  question,
  user,
  optionSet,
  option,
  eventSection,
  event,
  eventEntrySection,
  eventEntryQuestion,
  account,
  entryScore,
  notification,
} from '~/server/database/schema'
import { type InferSelectModel } from 'drizzle-orm'
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

  type UserNotification = InferSelectModel<typeof notification>

  type EventCard = InferSelectModel<typeof event>

  type questionWithResult = InferSelectModel<typeof question> & {
    resultOption?: InferSelectModel<typeof option> | null
    optionSet?:
      | (InferSelectModel<typeof optionSet> & {
          options: InferSelectModel<typeof option>[]
        })
      | null
  }

  type SectionWithQuestionOptionSet = InferSelectModel<typeof eventSection> & {
    questions: questionWithResult[]
  }

  type SectionWithQuestion = InferSelectModel<typeof eventSection> & {
    questions: questionWithResult[]
  }

  type QuestionWithResultOption = InferSelectModel<typeof question> & {
    resultOption?: InferSelectModel<typeof option> | null
  }

  type Section = InferSelectModel<typeof eventSection> & {
    questions: QuestionWithResultOption[]
  }

  type EventSectionWithQuestions = InferSelectModel<typeof eventSection> & {
    questions: (InferSelectModel<typeof question> & {
      resultOption: InferSelectModel<typeof option> | null
      optionSet:
        | (InferSelectModel<typeof optionSet> & {
            options: InferSelectModel<typeof option>[]
          })
        | null
    })[]
  }

  type PublicUser =  Omit<User, 'email' | 'emailVerified' | 'role'>

  type PredictorEvent =
    | (InferSelectModel<typeof event> & {
        entries: (InferSelectModel<typeof entry> & {
          user: PublicUser
          entrySections: (InferSelectModel<typeof eventEntrySection> & {
            entryQuestions: (InferSelectModel<typeof eventEntryQuestion> & {
              question: InferSelectModel<typeof question>
              entryOption?: InferSelectModel<typeof option>
            })[]
          })[]
        })[]
        sections: (InferSelectModel<typeof eventSection> & {
          questions: (InferSelectModel<typeof question> & {
            resultOption?: InferSelectModel<typeof option> | null
            optionSet?: InferSelectModel<typeof optionSet> & {
              options: InferSelectModel<typeof option>[]
            }
          })[]
        })[]
      })
    | null
    | undefined

  type EventEntryQuestion = InferSelectModel<typeof eventEntryQuestion> & {
    question: InferSelectModel<typeof question>
    entryOption?: InferSelectModel<typeof option> | null
  }

  type EventEntryQuestionWithOptions = InferSelectModel<typeof eventEntryQuestion> & {
    question: InferSelectModel<typeof question> & {
      optionSet: InferSelectModel<typeof optionSet> & {
        options: InferSelectModel<typeof option>[]
      }
    }
    entryOption: InferSelectModel<typeof option> | null
  }

  type Question = InferSelectModel<typeof question>
  type EventSection = InferSelectModel<typeof eventSection>
  type OptionSet = InferSelectModel<typeof optionSet> & {
    options: InferSelectModel<typeof option>[]
  }
  type Option = InferSelectModel<typeof option>
  type User = InferSelectModel<typeof user>
  type Account = InferSelectModel<typeof account>

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

  interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget
  }
}

export {}
