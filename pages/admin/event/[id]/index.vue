<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row-reverse gap-2">
      <UButton
        :loading="saving"
        icon="material-symbols:save"
        :disabled="!saveEnabled || !valid"
        @click="saveEvent">
        Save
      </UButton>
      <UButton
        :loading="saving"
        :disabled="session?.user.role !== 'ADMIN' || visible"
        icon="material-symbols:delete-outline"
        @click="deleteModal = true">
        Delete
      </UButton>
    </div>
    <div class="flex flex-col gap-2">
      <UContainer class="w-full max-w-screen-2xl">
        <EventHeader
          :id="event?.id"
          class="rounded-b-lg"
          :name="eventName"
          :description="eventDescription"
          :start-date="event?.startDate ?? new Date()"
          :end-date="event?.endDate ?? new Date()"
          :predictions-close-date="event?.closeDate ?? new Date()"
          :image="eventImage"
          hide-edit />
      </UContainer>
      <div class="flex flex-col">
        <UCheckbox
          v-model="visible"
          label="Enable Predictions"
          :disabled="(event?.entries.length || 0) > 0" />
        <span class="text-xs">
          This will lock everything in sections except for points & make the
          event visible
        </span>
      </div>
      <UFormGroup name="name" label="Event Name" required :error="validName">
        <UInput
          v-model="eventName"
          color="gray"
          variant="outline"
          placeholder="Event Name" />
      </UFormGroup>
      <UFormGroup name="slug" label="Slug" required :error="validSlug">
        <UInput
          v-model="eventSlug"
          color="gray"
          variant="outline"
          placeholder="Slug" />
      </UFormGroup>
      <UFormGroup name="description" label="Event Description">
        <UTextarea
          v-model="eventDescription"
          color="gray"
          variant="outline"
          placeholder="Event Description" />
      </UFormGroup>
      <UFormGroup name="image" label="Event Header Image" :error="validImage">
        <Upload label="Upload an Image" @upload="uploaded" />
        <UButton
          label="Remove Image"
          variant="link"
          @click="() => (eventImage = '')" />
      </UFormGroup>
      <UFormGroup
        name="eventDate"
        label="Event Date"
        required
        :error="validEventDate">
        <UPopover
          :popper="{ placement: 'bottom-start' }"
          :ui="{ trigger: 'w-fit' }">
          <UButton icon="i-heroicons-calendar-days-20-solid">
            {{ format(eventDate.start, 'd MMM, yyy hh:mm') }} -
            {{ format(eventDate.end, 'd MMM, yyy hh:mm') }}
          </UButton>

          <template #panel="{ close }">
            <DatePicker v-model="eventDate" @close="close" />
          </template>
        </UPopover>
      </UFormGroup>
      <UFormGroup
        name="predictionsCloseDate"
        label="Predictions Close Date"
        :error="validCloseDate"
        required>
        <UPopover
          :popper="{ placement: 'bottom-start' }"
          :ui="{ trigger: 'w-fit' }">
          <UButton icon="i-heroicons-calendar-days-20-solid">
            {{ format(predictionsCloseDate, 'd MMM, yyy hh:mm') }}
          </UButton>

          <template #panel="{ close }">
            <DatePicker v-model="predictionsCloseDate" @close="close" />
          </template>
        </UPopover>
      </UFormGroup>
    </div>

    <ModalDelete
      v-model="deleteModal"
      text="Are you sure you want to delete this event?"
      placeholder-text="Event Name"
      :input-match="eventName"
      @delete="deleteEvent" />
  </div>
</template>
<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'
import slugify from 'slugify'

import { format } from 'date-fns'
const { session } = useAuth()

definePageMeta({
  middleware: ['admin'],
  layout: 'admin-event',
  validate: route => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))

useHead({
  title: event.value?.name ?? 'New Event' + ' - Edit',
})

const saving = ref(false)
const valid = ref(true)
const deleteModal = ref(false)
const predictionsCloseDate = ref(event.value?.closeDate ?? new Date())
const eventDescription = ref(event.value?.description ?? '')
const eventImage = ref(event.value?.image ?? '')
const eventName = ref(event.value?.name ?? '')
const visible = ref(event.value?.visible ?? false)
const eventSlug = ref(event.value?.slug ?? '')
if ((event.value?.entries.length || 0) > 0) {
  visible.value = true
}

const eventDate = ref({
  start: event.value?.startDate ?? new Date(),
  end: event.value?.endDate ?? new Date(),
})

watchDebounced(
  [
    event,
    eventName,
    eventImage,
    eventDate,
    predictionsCloseDate,
    eventDescription,
    visible,
    eventSlug,
  ],
  () => {
    autosave = true
    saveEvent()
  },
  { debounce: 2000, maxWait: 2000, deep: true }
)
watchDeep(
  [
    event,
    eventName,
    eventImage,
    eventDate,
    predictionsCloseDate,
    eventDescription,
    visible,
    eventSlug,
  ],
  () => {
    saveEnabled.value = true
  }
)

watchDeep(eventName, () => {
  useHead({
    title: eventName.value ?? 'New Event' + ' - Edit',
  })
})

watch(eventDate, newVal => {
  if (predictionsCloseDate.value > newVal.start) {
    predictionsCloseDate.value = new Date(newVal.start)
  }
})

if (eventSlug.value.length === 0) {
  eventSlug.value = slugify(eventName.value, { lower: true })
}

watch(eventName, () => {
  eventSlug.value = slugify(eventName.value, { lower: true })
})

const saveEnabled = ref(false)
let autosave = false

const validName = computedEager(() => {
  if (eventName.value.length === 0) {
    valid.value = false
    return 'Name is Required!'
  }
  valid.value = true
})

const validSlug = computedEager(() => {
  if (eventSlug.value.length === 0) {
    valid.value = false
    return 'Slug is Required!'
  }
  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(eventSlug.value)) {
    valid.value = false
    return 'Slug is not valid!'
  }
  valid.value = true
})

const validEventDate = computedEager(() => {
  if (eventDate.value.end < eventDate.value.start) {
    valid.value = false
    return 'End Date must be after Start Date!'
  }
  valid.value = true
})

const validCloseDate = computedEager(() => {
  if (predictionsCloseDate.value > eventDate.value.start) {
    valid.value = false
    return 'Predictions Close Date must be before Event Start Date!'
  }
  valid.value = true
})

const validImage = computedEager(() => {
  if (eventImage.value !== '') {
    if (!isImage(eventImage.value)) {
      valid.value = false
      return 'Image is not valid url'
    }
  }
  valid.value = true
})

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate = await $client.eventsAdmin.updateEventDetails.mutate({
      id: Number(id),
      name: eventName.value || '',
      description: eventDescription.value || '',
      image: eventImage.value || '',
      startDate: eventDate.value.start,
      endDate: eventDate.value.end,
      closeDate: predictionsCloseDate.value,
      visible: visible.value,
      slug: eventSlug.value || '',
    })

    if (mutate) {
      saving.value = false
      saveEnabled.value = false
      if (!autosave) {
        toast.add({ title: 'Event Saved Successfully!' })
      }
      autosave = false
    }
  }
}

async function deleteEvent() {
  deleteModal.value = false
  saving.value = true
  const mutate = await $client.eventsAdmin.deleteEvent.mutate(Number(id))
  if (mutate) {
    navigateTo('/admin/event')
  }
}
const toast = useToast()

function uploaded(data: Ref<UploadApiResponse>) {
  eventImage.value = `${data.value.public_id}.${data.value.format}`
  saveEvent()
}
</script>
