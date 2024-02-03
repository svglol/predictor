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
          v-model="event_name"
          color="gray"
          variant="outline"
          placeholder="Event Name" />
      </UFormGroup>
      <UFormGroup name="slug" label="Slug" required :error="validSlug">
        <UInput
          v-model="event_slug"
          color="gray"
          variant="outline"
          placeholder="Slug" />
      </UFormGroup>
      <UFormGroup name="description" label="Event Description">
        <UTextarea
          v-model="event_description"
          color="gray"
          variant="outline"
          placeholder="Event Description" />
      </UFormGroup>
      <UFormGroup name="image" label="Event Header Image" :error="validImage">
        <Upload id="event" label="Upload an Image" @upload="uploaded" />
        <UContainer class="h-60 max-w-screen-2xl">
          <NuxtImg
            v-if="event_image !== ''"
            provider="cloudinary"
            :src="event_image"
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
      :input-match="event_name"
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
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await useFetch(`/api/event/id/${Number(id)}`)

useHead({
  title: event.value?.name ?? 'New Event' + ' - Edit',
})

const saving = ref(false)
const valid = ref(true)
const deleteModal = ref(false)
const eventStartDate = ref(' ')
const eventEndDate = ref(' ')
const predictionsCloseDate = ref(' ')
const event_description = ref(event.value?.description ?? '')
const event_image = ref(event.value?.image ?? '')
const event_name = ref(event.value?.name ?? '')
const visible = ref(event.value?.visible ?? false)
const event_slug = ref(event.value?.slug ?? '')
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
      event_name,
      eventStartDate,
      eventEndDate,
      event_image,
      predictionsCloseDate,
      event_description,
      visible,
      event_slug,
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
      event_name,
      event_image,
      eventStartDate,
      eventEndDate,
      predictionsCloseDate,
      event_description,
      visible,
      event_slug,
    ],
    () => {
      saveEnabled.value = true
    }
  )
})

watchDeep(event_name, () => {
  useHead({
    title: event_name.value ?? 'New Event' + ' - Edit',
  })
})

if (event_slug.value.length === 0) {
  event_slug.value = slugify(event_name.value, { lower: true })
}

watch(event_name, () => {
  event_slug.value = slugify(event_name.value, { lower: true })
})

const saveEnabled = ref(false)
let autosave = false

const validName = computedEager(() => {
  if (event_name.value.length === 0) {
    valid.value = false
    return 'Name is Required!'
  }
  valid.value = true
})

const validSlug = computedEager(() => {
  if (event_slug.value.length === 0) {
    valid.value = false
    return 'Slug is Required!'
  }
  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(event_slug.value)) {
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
  if (event_image.value !== '') {
    if (!isImage(event_image.value)) {
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
      name: event_name.value || '',
      description: event_description.value || '',
      image: event_image.value || '',
      startDate: convertTimeToUTC(eventStartDate.value),
      endDate: convertTimeToUTC(eventEndDate.value),
      closeDate: convertTimeToUTC(predictionsCloseDate.value),
      visible: visible.value,
      slug: event_slug.value || '',
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
  event_image.value = `${data.value.public_id}.${data.value.format}`
  saveEvent()
}
</script>
