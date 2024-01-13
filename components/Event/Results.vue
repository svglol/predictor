<template>
  <div class="flex flex-col space-y-4 py-2">
    <div
      v-for="section in event?.sections"
      :key="section.id"
      class="flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
      :class="{ hidden: sectionEmpty(section) }">
      <div class="inline-block space-x-1">
        <span class="text-xl text-black dark:text-white">
          {{ section.heading }}
        </span>
        <span class="text-xs">
          ({{ getSectionTotalPoints(section) }}
          {{ pluralize('point', getSectionTotalPoints(section)) }})
        </span>
      </div>
      <template v-for="question in section.questions" :key="question.id">
        <div v-if="hasResult(question)" class="flex flex-col space-y-1">
          <div class="inline-block space-x-1">
            <span class="font-semibold">{{ question.question }}</span>
            <span class="text-xs">
              ({{ question.points }} {{ pluralize('point', question.points) }})
            </span>
          </div>

          <div
            class="flex flex-col items-start space-x-0 space-y-1 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <span class="italic">{{ useGetResult(question) }}</span>
            <UBadge
              v-if="getUsersCorrect(question).length > 0"
              color="green"
              size="lg"
              variant="solid"
              class="flex flex-wrap items-center gap-2">
              <Icon name="uil:check" color="black" size="1em" />
              <UTooltip
                v-for="user in getUsersCorrect(question)"
                :key="user.id"
                :text="user.name ?? ''">
                <UAvatar
                  class="text-gray-400"
                  size="2xs"
                  :src="user.image ?? ''"
                  :alt="user.name ?? ''" />
              </UTooltip>
            </UBadge>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pluralize from 'pluralize'
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

function getUsersCorrect(
  resultQuestion: ImmutableObject<QuestionWithResultOption>
) {
  const users: {
    readonly id: number
    readonly name: string | null
    readonly email: string | null
    readonly emailVerified: Date | null
    readonly image: string | null
    readonly role: string
  }[] = []
  event.value?.entries.forEach(entry => {
    entry.entrySections.forEach(section => {
      section.entryQuestions
        .filter(question => {
          return question.question.id === resultQuestion.id
        })
        .forEach(question => {
          if (question.questionScore > 0) users.push(entry.user)
        })
    })
  })
  return users
}

function pluralize(str: string, number: number) {
  return Pluralize(str, number)
}

function getSectionTotalPoints(section: Immutable<Section>) {
  let total = 0
  section.questions.forEach(question => {
    total += question.points
  })
  return total
}

function sectionEmpty(section: Immutable<Section>) {
  let empty = true
  section.questions.forEach(question => {
    if (hasResult(question)) empty = false
  })
  return empty
}
</script>
