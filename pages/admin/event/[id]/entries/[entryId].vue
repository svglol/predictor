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
        @click="updateEntry"
      >
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
            year="numeric"
          />
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
          />
        </div>
      </div>
      <UDivider />
      <div class="flex flex-col gap-4">
        <div class="flex flex-col items-center gap-2">
          <span class="font-bold text-black dark:text-white">{{ entrantName ?? username }}</span>
          <NuxtImg v-if="entrantImage !== ''" class="size-44 object-cover" :src="entrantImage" provider="cloudinary" placeholder height="400" width="400" fit="cover" />
          <NuxtImg v-else class="size-44 object-cover" :src="avatar" />
          <span class="text-black dark:text-white">{{ entrantQuote }}</span>
        </div>
        <UFormGroup label="Entrant Name">
          <UInput
            v-model="entrantName" :disabled="session?.user.role !== 'ADMIN' || entry?.event.status === 'FINISHED'" color="gray" variant="outline"
          />
        </UFormGroup>
        <UFormGroup label="Entrant Quote">
          <UInput
            v-model="entrantQuote" color="gray" variant="outline" :disabled="session?.user.role !== 'ADMIN' || entry?.event.status === 'FINISHED'"
          />
        </UFormGroup>
        <UFormGroup name="image" label="Entrant Image" :error="validImage">
          <UIUpload
            label="Upload an Image"
            :disabled="session?.user.role !== 'ADMIN' || entry?.event.status === 'FINISHED'"
            @upload="uploaded"
          />
          <UButton
            label="Remove Image"
            variant="link"
            :disabled="session?.user.role !== 'ADMIN' || entry?.event.status === 'FINISHED'"
            @click="clearImage"
          />
        </UFormGroup>
      </div>
      <UDivider />
      <div class="flex flex-col gap-4">
        <span class="text-black dark:text-white">Response</span>
        <div
          v-for="section in entry?.entrySections"
          :key="section.id"
          class="flex flex-col gap-1 border border-gray-200 p-2 dark:border-gray-800"
        >
          <span class="text-lg text-black dark:text-white">
            {{ section.section.heading }}
          </span>
          <div
            v-for="entryQuestion in section.entryQuestions"
            :key="entryQuestion.id"
            class="flex flex-col gap-2"
          >
            <AdminEventEntriesQuestion
              :entry-question="entryQuestion as EventEntryQuestionWithOptions"
              :disabled="
                session?.user.role !== 'ADMIN'
                  || entry?.event.status === 'FINISHED'
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'
import { ModalSave, UDivider } from '#components'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: (route) => {
    return /^\d+$/.test(String(route.params.entryId))
  },
  pageTransition: false,
})

const { session } = useAuth()
const route = useRoute()
const entryId = route.params.entryId
const img = useImage()

const { data: entry } = await useClient().eventsAdmin.getEventEntry.useQuery(
  Number(entryId),
)
const updatedAt = ref(entry?.value?.updatedAt ?? '')
const createdAt = ref(entry?.value?.createdAt ?? '')
const username = ref(entry?.value?.user.name ?? '')
const avatar = ref(entry?.value?.user.image ?? '')
const disabled = ref(true)
const saving = ref(false)

const entrantName = computed({
  get: () => entry.value?.entrantName,
  set: (value) => {
    if (entry.value && value)
      entry.value.entrantName = value
  },
})

const entrantQuote = computed({
  get: () => entry.value?.entrantQuote,
  set: (value) => {
    if (entry.value && value)
      entry.value.entrantQuote = value
  },
})

const entrantImage = computed({
  get: () => entry.value?.entrantImage ?? '',
  set: (value) => {
    if (entry.value && value)
      entry.value.entrantImage = value
  },
})

useHead({
  title: `${entry.value?.user.name} - Entry`,
})

const error = computed(() => {
  let hasError = false
  entry.value?.entrySections.forEach((section) => {
    section.entryQuestions.forEach((question) => {
      if (question.question.type === 'MULTI' && !question.entryOption)
        hasError = true

      if (question.question.type === 'TEXT' && !question.entryString)
        hasError = true

      if (
        question.question.type === 'NUMBER'
        && question.entryNumber === null
      )
        hasError = true

      if (question.question.type === 'TIME' && !question.entryString)
        hasError = true

      if (
        question.question.type === 'BOOLEAN'
        && question.entryBoolean === null
      )
        hasError = true
    })
  })
  return hasError
})

watchDeep(entry, () => {
  disabled.value = false
})

function handler(e: BeforeUnloadEvent) {
  e.preventDefault()
  e.returnValue = ''
}
watchEffect(() => {
  if (disabled.value && window)
    window.addEventListener('beforeunload', handler)
})

const modal = useModal()
onBeforeRouteLeave((_to, _from, next) => {
  if (!disabled.value) {
    modal.open(ModalSave, {
      text: 'You have unsaved changes!',
      close: () => {
        window.removeEventListener('beforeunload', handler)
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
  }
  else {
    window.removeEventListener('beforeunload', handler)
    next()
  }
})

async function updateEntry() {
  saving.value = true
  // save
  if (!entry.value)
    return
  await useClient().eventsAdmin.updateEntryAdmin.mutate({
    id: Number(entryId),
    eventId: entry.value?.event.id,
    entrantName: entry.value.entrantName,
    entrantQuote: entry.value.entrantQuote,
    entrantImage: entry.value.entrantImage,
    updatedQuestions: entry.value?.entrySections.flatMap((section) => {
      return section.entryQuestions.map((question) => {
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
  window.removeEventListener('beforeunload', handler)
  saving.value = false
  disabled.value = true
}

function uploaded(data: Ref<UploadApiResponse>) {
  entrantImage.value = `${data.value.public_id}.${data.value.format}`
}

function clearImage() {
  if (entry.value)
    entry.value.entrantImage = ''
}

const validImage = computed(() => {
  if (entrantImage.value !== '') {
    if (!isImage(entrantImage.value))
      return 'Image is not valid url'
  }
  return undefined
})
</script>
