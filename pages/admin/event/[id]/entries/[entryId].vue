<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="entry?.event.name">
      <template #badges>
        <UBadge v-if="error" variant="subtle" color="red">
          Error with response
        </UBadge>
      </template>
      <UButton
        v-if="
          session?.user.role === 'ADMIN' && entry?.event.status !== 'FINISHED'
        "
        :loading="saving"
        :disabled="disabled || error"
        @click="updateEntry">
        Update Entry
      </UButton>
    </AdminEventHeader>
    <div class="flex flex-col space-y-4 p-4">
      <div class="flex flex-row items-stretch gap-4">
        <div class="flex flex-col">
          <span class="text-black dark:text-white">User</span>
          <div class="flex flex-row items-center space-x-2">
            <UAvatar :src="img(avatar)" :alt="username" size="3xs" />
            <span>{{ username }}</span>
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
            year="numeric" />
        </div>
        <div class="flex flex-col">
          <span class="text-black dark:text-white">Updated at</span>
          <NuxtTime
            :datetime="updatedAt"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric" />
        </div>
      </div>
      <UDivider />
      <div class="flex flex-col gap-4">
        <span class="text-black dark:text-white">Response</span>
        <div
          v-for="section in entry?.entrySections"
          :key="section.id"
          class="flex flex-col gap-1 border border-gray-200 p-2 dark:border-gray-800">
          <span class="text-lg text-black dark:text-white">
            {{ section.section.heading }}
          </span>
          <div
            v-for="entryQuestion in section.entryQuestions"
            :key="entryQuestion.id"
            class="flex flex-col gap-2">
            <AdminEventEntriesQuestion
              :entry-question="entryQuestion as EventEntryQuestionWithOptions"
              :disabled="
                session?.user.role !== 'ADMIN' ||
                entry?.event.status === 'FINISHED'
              " />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModalSave } from '#components'
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: route => {
    return /^\d+$/.test(String(route.params.entryId))
  },
  pageTransition: false,
})

const { session } = useAuth()
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
const disabled = ref(true)
const saving = ref(false)

useHead({
  title: entry.value?.user.name + ' - Entry',
})

const error = computed(() => {
  let hasError = false
  entry.value?.entrySections.forEach(section => {
    section.entryQuestions.forEach(question => {
      if (question.question.type === 'MULTI' && !question.entryOption) {
        hasError = true
      }
      if (question.question.type === 'TEXT' && !question.entryString) {
        hasError = true
      }
      if (
        question.question.type === 'NUMBER' &&
        question.entryNumber === null
      ) {
        hasError = true
      }
      if (question.question.type === 'TIME' && !question.entryString) {
        hasError = true
      }
      if (
        question.question.type === 'BOOLEAN' &&
        question.entryBoolean === null
      ) {
        hasError = true
      }
    })
  })
  return hasError
})

watchDeep(entry, () => {
  disabled.value = false
})
const modal = useModal()
onBeforeRouteLeave((_to, _from, next) => {
  if (!disabled.value) {
    modal.open(ModalSave, {
      text: 'You have unsaved changes!',
      close: () => {
        modal.close()
        next()
      },
      save: async () => {
        await updateEntry()
        modal.close()
        next()
      },
      icon: 'carbon:warning',
    })
  } else next()
})

async function updateEntry() {
  saving.value = true
  // save
  if (!entry.value) return
  await $client.eventsAdmin.updateEntryAdmin.mutate({
    id: Number(entryId),
    eventId: entry.value?.event.id,
    updatedQuestions: entry.value?.entrySections.flatMap(section => {
      return section.entryQuestions.map(question => {
        return {
          id: question.id,
          eventEntrySectionId: section.id,
          entryString: question.entryString,
          entryBoolean: question.entryBoolean,
          entryNumber: question.entryNumber,
          entryOptionId: question.entryOptionId,
        }
      })
    }),
  })
  saving.value = false
  disabled.value = true
}
</script>
