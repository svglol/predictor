<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="entry?.event.name" />
    <div class="flex flex-col space-y-4 p-4">
      <div class="flex flex-row items-stretch gap-4">
        <div class="flex items-baseline">
          <div class="flex flex-1 flex-col">
            <span class="text-black dark:text-white">User</span>
            <div class="flex flex-row items-center space-x-2">
              <UAvatar :src="img(avatar)" :alt="username" size="3xs" />
              <span>{{ username }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-black dark:text-white">Created at</span>
          <NuxtTime
            :datetime="createdAt"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
            class="text-sm" />
        </div>
        <div class="flex flex-col">
          <span class="text-black dark:text-white">Updated at</span>
          <NuxtTime
            :datetime="updatedAt"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
            class="text-sm" />
        </div>
      </div>
      <UDivider />
      <div class="flex flex-col space-y-2">
        <span class="text-black dark:text-white">Response</span>
        <div
          v-for="section in entry?.entrySections"
          :key="section.id"
          class="flex flex-col">
          <span class="text-black dark:text-white">
            {{ section.section.heading }}
          </span>
          <div
            v-for="entryQuestion in section.entryQuestions"
            :key="entryQuestion.id"
            class="flex flex-col">
            <span class="font-semibold">
              {{ entryQuestion.question.question }}
            </span>
            <UBadge :color="getColor(entryQuestion)" size="lg" variant="solid">
              {{ getAnswer(entryQuestion) }}
            </UBadge>
          </div>
        </div>
      </div>
      <UBadge color="red" class="hidden" />
      <UBadge color="blue" class="hidden" />
      <UBadge color="green" class="hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: route => {
    return /^\d+$/.test(String(route.params.entryId))
  },
  pageTransition: false,
})

const route = useRoute()
const entryId = route.params.entryId
const img = useImage()

const { $client } = useNuxtApp()

const { data: entry } = await $client.eventsAdmin.getEventEntry.useQuery(
  Number(entryId)
)
const updatedAt = ref(entry?.value?.updatedAt ?? '')
const createdAt = ref(entry?.value?.createdAt ?? '')
const username = ref(entry?.value?.user.name ?? '')
const avatar = ref(entry?.value?.user.image ?? '')

useHead({
  title: entry.value?.user.name + ' - Entry',
})

function getAnswer(entryQuestion: EventEntryQuestion) {
  const type = entryQuestion.question.type
  switch (type) {
    case 'TEXT':
      return entryQuestion.entryString
    case 'NUMBER':
      return entryQuestion.entryNumber
    case 'TIME':
      return entryQuestion.entryString
    case 'BOOLEAN':
      if (
        entryQuestion.entryBoolean === undefined ||
        entryQuestion.entryBoolean === null
      )
        return null
      if (entryQuestion.entryBoolean) return 'Yes'
      else return 'No'
    case 'MULTI':
      return entryQuestion.entryOption?.title
    default:
      return ''
  }
}

function getColor(entryQuestion: EventEntryQuestion) {
  const type = entryQuestion.question.type
  if (type === 'MULTI' && !entryQuestion.question.optionId) return 'blue'
  else if (type === 'TEXT' && !entryQuestion.question.resultString)
    return 'blue'
  else if (type === 'NUMBER' && !entryQuestion.question.resultNumber)
    return 'blue'
  else if (type === 'TIME' && !entryQuestion.question.resultString)
    return 'blue'
  else if (type === 'BOOLEAN' && entryQuestion.question.resultBoolean === null)
    return 'blue'
  else if (entryQuestion.questionScore === 0) return 'red'
  else if (entryQuestion.questionScore > 0) return 'green'
  else return 'blue'
}
</script>
