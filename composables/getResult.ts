import { Prisma } from "@prisma/client";

const questionWithResultOption = Prisma.validator<Prisma.QuestionArgs>()({
  include: { resultOption: true },
});
type QuestionWithResultOption = Prisma.QuestionGetPayload<
  typeof questionWithResultOption
>;

export const useGetResult = (question: QuestionWithResultOption | null) => {
  if(!question) return "";
  switch (question.type) {
    case "TEXT":
      return question.resultString;
    case "BOOLEAN":
      return question.resultBoolean;
    case "NUMBER":
      return question.resultNumber;
    case "TIME":
      return question.resultTime;
    case "MULTI": {
      if (question.resultOption) {
        return question.resultOption;
      }
    }
    default:
      return "";
  }
};
