<template>
  <div class="flex flex-col space-y-4 py-2">
    <div
      v-for="section in event.sections"
      :key="section.id"
      class="flex flex-col space-y-1"
    >
      <div class="flex flex-row items-baseline space-x-1">
        <span class="text-xl text-black dark:text-white">{{
          section.heading
        }}</span>
        <span class="text-xs">
          ({{ getSectionTotalPoints(section) }}
          {{ pluralize("point", getSectionTotalPoints(section)) }})</span
        >
      </div>
      <div
        v-for="question in section.questions"
        :key="question.id"
        class="flex flex-col"
      >
        <template v-if="useGetResult(question)">
          <div class="flex flex-row items-baseline space-x-1">
            <span class="font-semibold"> {{ question.question }}</span>
            <span class="text-xs">
              ({{ question.points }}
              {{ pluralize("point", question.points) }})</span
            >
          </div>
          <div class="flex flex-row items-center space-x-1">
            <span class="font-light">{{ useGetResult(question) }}</span>
            <UTooltip
              v-for="user in getUsersCorrect(question)"
              :key="user.id"
              :text="user.name ?? ''"
            >
              <UAvatar size="2xs" :src="user.image ?? ''" />
            </UTooltip>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pluralize from "pluralize"
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

function getUsersCorrect(resultQuestion: QuestionWithResultOption) {
  let users: {
    readonly id: number
    readonly name: string | null
    readonly email: string | null
    readonly emailVerified: Date | null
    readonly image: string | null
    readonly role: string
  }[] = []
  event.value.entries.forEach((entry) => {
    entry.entrySections.forEach((section) => {
      section.entryQuestions
        .filter((question) => {
          return question.question.id === resultQuestion.id
        })
        .forEach((question) => {
          if (question.questionScore > 0) users.push(entry.user)
        })
    })
  })
  return users
}

function pluralize(str: string, number: number) {
  return Pluralize(str, number)
}

function getSectionTotalPoints(section: Section) {
  let total = 0
  section.questions.forEach((question) => {
    total += question.points
  })
  return total
}
</script>

<style scoped></style>
