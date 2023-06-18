import { Prisma } from "@prisma/client"
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
    include: { questions: { include: { resultOption: true } } },
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
}

export {}
