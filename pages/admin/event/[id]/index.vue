<template>
  <div>
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
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
        <Upload id="event" label="Upload an Image" @upload="uploaded" />
        <UContainer class="h-60 max-w-screen-2xl">
          <NuxtImg
            v-if="eventImage !== ''"
            provider="cloudinary"
            :src="eventImage"
            class="-z-50 my-2 h-60 w-full rounded-lg object-cover" />
        </UContainer>
      </UFormGroup>
      <UFormGroup
        name="eventStartDate"
        label="Event Start Date"
        required
        :error="validStartDate">
        <UInput
          v-model="eventStartDate"
          color="gray"
          variant="outline"
          type="datetime-local" />
      </UFormGroup>
      <UFormGroup
        name="eventEndDate"
        label="Event End Date"
        required
        :error="validEndDate">
        <UInput
          v-model="eventEndDate"
          color="gray"
          variant="outline"
          type="datetime-local"
          :min="eventStartDate" />
      </UFormGroup>
      <UFormGroup
        name="predictionsCloseDate"
        label="Predictions Close Date"
        required
        :error="validCloseDate">
        <UInput
          v-model="predictionsCloseDate"
          color="gray"
          variant="outline"
          type="datetime-local"
          :max="eventStartDate" />
      </UFormGroup>
    </div>

    <DeleteModal
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
const eventStartDate = ref(' ')
const eventEndDate = ref(' ')
const predictionsCloseDate = ref(' ')
const eventDescription = ref(event.value?.description ?? '')
const eventImage = ref(event.value?.image ?? '')
const eventName = ref(event.value?.name ?? '')
const visible = ref(event.value?.visible ?? false)
const eventSlug = ref(event.value?.slug ?? '')
if ((event.value?.entries.length || 0) > 0) {
  visible.value = true
}

onMounted(() => {
  eventStartDate.value = convertTimeToLocal(
    event.value?.startDate ?? new Date()
  )
  eventEndDate.value = convertTimeToLocal(event.value?.endDate ?? new Date())
  predictionsCloseDate.value = convertTimeToLocal(
    event.value?.closeDate ?? new Date()
  )

  watchDebounced(
    [
      event,
      eventName,
      eventStartDate,
      eventEndDate,
      eventImage,
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
      eventStartDate,
      eventEndDate,
      predictionsCloseDate,
      eventDescription,
      visible,
      eventSlug,
    ],
    () => {
      saveEnabled.value = true
    }
  )
})

watchDeep(eventName, () => {
  useHead({
    title: eventName.value ?? 'New Event' + ' - Edit',
  })
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

const validStartDate = computedEager(() => {
  if (eventStartDate.value.length === 0) {
    valid.value = false
    return 'Start Date is Required!'
  }
  if (new Date(eventStartDate.value) >= new Date(eventEndDate.value)) {
    valid.value = false
    return 'Start Date must be before End Date!'
  }
  valid.value = true
})

const validEndDate = computedEager(() => {
  if (eventEndDate.value.length === 0) {
    valid.value = false
    return 'End Date is Required!'
  }
  if (new Date(eventEndDate.value) <= new Date(eventStartDate.value)) {
    valid.value = false
    return 'End Date must be after Start Date!'
  }
  valid.value = true
})

const validCloseDate = computedEager(() => {
  if (predictionsCloseDate.value.length === 0) {
    valid.value = false
    return 'Predictions Close Date is Required!'
  }
  if (new Date(predictionsCloseDate.value) > new Date(eventStartDate.value)) {
    valid.value = false
    return 'Predictions Close Date must be before Start Date!'
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
      startDate: convertTimeToUTC(eventStartDate.value),
      endDate: convertTimeToUTC(eventEndDate.value),
      closeDate: convertTimeToUTC(predictionsCloseDate.value),
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
