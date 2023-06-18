export const useGetResult = (question: QuestionWithResultOption | null) => {
  if (!question) return ""
  switch (question.type) {
    case "TEXT":
      return question.resultString
    case "BOOLEAN":
      return question.resultBoolean
    case "NUMBER":
      return question.resultNumber
    case "TIME":
      return question.resultString
    case "MULTI": {
      if (question.resultOption) {
        return question.resultOption
      }
    }
    default:
      return ""
  }
}
