<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="eventName">
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
    </AdminEventHeader>

    <div class="flex flex-col gap-2 p-4">
      <UContainer class="w-full max-w-screen-2xl">
        <EventHeader
          :id="event?.id"
          class="rounded-b-lg"
          :name="eventName"
          :description="eventDescription"
          :start-date="eventDate.start"
          :end-date="eventDate.end"
          :predictions-close-date="predictionsCloseDate"
          :image="eventImage"
          hide-edit />
      </UContainer>
      <UDivider />
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
      <UDivider />
      <UFormGroup name="name" label="Event Name" required :error="validName">
        <UInput
          v-model="eventName"
          color="gray"
          variant="outline"
          placeholder="Event Name" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="slug" label="Slug" required :error="validSlug">
        <UInput
          v-model="eventSlug"
          color="gray"
          variant="outline"
          placeholder="Slug" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="description" label="Event Description">
        <UTextarea
          v-model="eventDescription"
          color="gray"
          variant="outline"
          placeholder="Event Description" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="image" label="Event Header Image" :error="validImage">
        <Upload label="Upload an Image" @upload="uploaded" />
        <UButton
          label="Remove Image"
          variant="link"
          @click="() => (eventImage = '')" />
      </UFormGroup>
      <UDivider />
      <UFormGroup
        name="eventDate"
        label="Event Date"
        required
        :error="validEventDate">
        <div class="w-fit">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton icon="i-heroicons-calendar-days-20-solid">
              {{ format(eventDate.start, 'd MMM, yyy hh:mm') }} -
              {{ format(eventDate.end, 'd MMM, yyy hh:mm') }}
            </UButton>

            <template #panel>
              <DatePicker v-model="eventDate" />
            </template>
          </UPopover>
        </div>
      </UFormGroup>
      <UDivider />
      <UFormGroup
        name="predictionsCloseDate"
        label="Predictions Close Date"
        :error="validCloseDate"
        required>
        <div class="w-fit">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton icon="i-heroicons-calendar-days-20-solid">
              {{ format(predictionsCloseDate, 'd MMM, yyy hh:mm') }}
            </UButton>

            <template #panel>
              <DatePicker v-model="predictionsCloseDate" />
            </template>
          </UPopover>
        </div>
      </UFormGroup>
      <UDivider />
      <UFormGroup name="eventInfo" label="Information">
        <Tiptap v-model="content" />
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
  layout: 'admin',
  validate: route => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))

useHead({
  title: event.value?.name ?? 'New Event' + ' - Edit',
})

const saving = ref(false)
const deleteModal = ref(false)
const predictionsCloseDate = ref(event.value?.closeDate ?? new Date())
const eventDescription = ref(event.value?.description ?? '')
const eventImage = ref(event.value?.image ?? '')
const eventName = ref(event.value?.name ?? '')
const visible = ref(event.value?.visible ?? false)
const eventSlug = ref(event.value?.slug ?? '')
const content = ref(event.value?.information ?? '')
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
    content,
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
    content,
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
    predictionsCloseDate.value = newVal.start
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

const validName = computed(() => {
  if (eventName.value.length === 0) {
    return 'Name is Required!'
  }
})

const validSlug = computed(() => {
  if (eventSlug.value.length === 0) {
    return 'Slug is Required!'
  }
  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(eventSlug.value)) {
    return 'Slug is not valid!'
  }
})

const validEventDate = computed(() => {
  if (eventDate.value.end < eventDate.value.start) {
    return 'End Date must be after Start Date!'
  }
})

const validCloseDate = computed(() => {
  if (predictionsCloseDate.value > eventDate.value.start) {
    return 'Predictions Close Date must be before Event Start Date!'
  }
})

const validImage = computed(() => {
  if (eventImage.value !== '') {
    if (!isImage(eventImage.value)) {
      return 'Image is not valid url'
    }
  }
})

const valid = computed(() => {
  return (
    validName.value === undefined &&
    validSlug.value === undefined &&
    validEventDate.value === undefined &&
    validCloseDate.value === undefined &&
    validImage.value === undefined
  )
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
      information: content.value || '',
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
