<template>
  <div class="space-y-2 py-2">
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
        class="flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex flex-row items-baseline space-x-1">
          <span class="mb-2 text-xl text-black dark:text-white">
            {{ getSectionName(section.sectionId) }}</span
          >
          <span class="text-xs">
            ({{ getSectionTotalPoints(section) }}
            {{ pluralize("point", getSectionTotalPoints(section)) }})</span
          >
        </div>
        <div
          v-for="entryQuestion in section.entryQuestions"
          :key="entryQuestion.id"
          class="flex flex-col"
        >
          <div class="flex flex-row items-baseline space-x-1">
            <span class="font-semibold">{{
              getQuestionName(entryQuestion.questionId)
            }}</span>
            <span class="text-xs">
              ({{ entryQuestion.questionScore }}
              {{ pluralize("point", entryQuestion.questionScore) }})</span
            >
          </div>
          <UBadge :color="getColor(entryQuestion)" size="lg" variant="solid">{{
            getAnswer(entryQuestion)
          }}</UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pluralize from "pluralize"
const { session } = useAuth()
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

const people = ref(
  event.value.entries
    .map((entry) => entry.user)
    .map((user) => {
      return {
        id: user.id,
        label: user.name,
        avatar: { src: user.image },
      }
    })
)

const predicionsOpen = computed(() => {
  if (event.value.predictions_close_date === null) return false
  return event.value.predictions_close_date > new Date()
})

if (predicionsOpen.value && session.value.user.role === "USER") {
  //remove all users except current user
  people.value = people.value.filter(
    (person) => person.id === session.value.user.id
  )
}

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

function pluralize(str: string, number: number) {
  return Pluralize(str, number)
}

function getSectionTotalPoints(section: EventEntrySection) {
  let total = 0
  section.entryQuestions.forEach((question) => {
    total += question.questionScore
  })
  return total
}
</script>

<style scoped></style>
