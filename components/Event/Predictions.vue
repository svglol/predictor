<template>
  <div class="py-2">
    <USelectMenu v-model="selected" :options="people" size="xl">
      <template #label>
        <UAvatar :src="selected.avatar.src ?? ''" size="3xs" />
        {{ selected.label }}
      </template>
    </USelectMenu>
    <div class="flex flex-col space-y-2">
      <div
        v-for="section in selectedEntry?.entrySections"
        :key="section.id"
        class="flex flex-col"
      >
        <span class="text-xl text-black dark:text-white">
          {{ getSectionName(section.sectionId) }}</span
        >
        <div
          v-for="entryQuestion in section.entryQuestions"
          :key="entryQuestion.id"
          class="flex flex-col"
        >
          <span class="font-semibold">{{
            getQuestionName(entryQuestion.questionId)
          }}</span>
          <UBadge :color="getColor(entryQuestion)" size="lg" variant="solid">{{
            getAnswer(entryQuestion)
          }}</UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { session } = useAuth()
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

const people = computed(() => {
  return event.value.entries
    .map((entry) => entry.user)
    .map((user) => {
      return {
        id: user.id,
        label: user.name,
        avatar: { src: user.image },
      }
    })
})

const selected = ref(
  people.value.find((person) => person.id === session.value.user.id) ??
    people.value[0]
)

const selectedEntry = computed(() => {
  return event.value.entries.find((entry) => {
    return entry.user.id === selected.value.id
  })
})

function getSectionName(sectionId: number) {
  return event.value.sections.find((section) => section.id === sectionId)
    ?.heading
}

function getQuestionName(questionId: number) {
  let result = ""
  event.value.sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.id === questionId) {
        result = question.question ?? ""
      }
    })
  })
  return result
}

function getColor(entryQuestion: EventEntryQuestion) {
  const type = entryQuestion.question.type
  if (type === "MULTI" && !entryQuestion.question.optionId) return "blue"
  else if (type === "TEXT" && !entryQuestion.question.resultString)
    return "blue"
  else if (type === "NUMBER" && !entryQuestion.question.resultNumber)
    return "blue"
  else if (type === "TIME" && !entryQuestion.question.resultString)
    return "blue"
  else if (type === "BOOLEAN" && !entryQuestion.question.resultBoolean)
    return "blue"
  else if (entryQuestion.questionScore === 0) return "red"
  else if (entryQuestion.questionScore > 0) return "green"
  else return "blue"
}

function getAnswer(entryQuestion: EventEntryQuestion) {
  const type = entryQuestion.question.type
  switch (type) {
    case "TEXT":
      return entryQuestion.entryString
    case "NUMBER":
      return entryQuestion.entryNumber
    case "TIME":
      return entryQuestion.entryString
    case "BOOLEAN":
      return entryQuestion.entryBoolean
    case "MULTI":
      return entryQuestion.entryOption?.title
    default:
      return ""
  }
}
</script>

<style scoped></style>
