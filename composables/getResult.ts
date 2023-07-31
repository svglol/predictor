export const useGetResult = (question: QuestionWithResultOption | null) => {
  if (!question) return ''
  switch (question.type) {
    case 'TEXT':
      return question.resultString
    case 'BOOLEAN':
      if (
        question.resultBoolean === undefined ||
        question.resultBoolean === null
      )
        return null
      if (question.resultBoolean) return 'Yes'
      else return 'No'
    case 'NUMBER':
      return question.resultNumber
    case 'TIME':
      return question.resultString
    case 'MULTI':
      {
        if (question.resultOption) {
          return question.resultOption.title
        }
      }
      break
    default:
      return ''
  }
}
