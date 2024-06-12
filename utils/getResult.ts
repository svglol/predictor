export function useGetResult(question: ImmutableObject<QuestionWithResultOption> | null) {
  if (!question)
    return ''
  switch (question.type) {
    case 'TEXT':
      return question.resultString
    case 'BOOLEAN':
      if (
        question.resultBoolean === undefined
        || question.resultBoolean === null
      ) {
        return null
      }
      if (question.resultBoolean)
        return 'Yes'
      else return 'No'
    case 'NUMBER':
      return question.resultNumber
    case 'TIME':
      return question.resultString
    case 'MULTI':
      if (question.resultOption)
        return question.resultOption.title

      break
    default:
      return ''
  }
}

export function hasResult(question: ImmutableObject<QuestionWithResultOption> | null) {
  if (!question)
    return false
  switch (question.type) {
    case 'TEXT':
      if (question.resultString === undefined || question.resultString === null)
        return false
      else return true
    case 'BOOLEAN':
      if (
        question.resultBoolean === undefined
        || question.resultBoolean === null
      ) {
        return false
      }
      else {
        return true
      }
    case 'NUMBER':
      if (question.resultNumber === undefined || question.resultNumber === null)
        return false
      else return true
    case 'TIME':
      if (question.resultString === undefined || question.resultString === null)
        return false
      else return true
    case 'MULTI':
      if (question.resultOption === undefined || question.resultOption === null)
        return false
      else return true
    default:
      return false
  }
}
