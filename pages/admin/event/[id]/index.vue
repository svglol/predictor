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
        :disabled="
          session?.user.role !== 'ADMIN' || event?.status === 'PUBLISHED'
        "
        icon="material-symbols:delete-outline"
        @click="openDeleteModal">
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
      <UFormGroup name="eventStatus" label="Status" required>
        <USelectMenu v-model="status" :options="statusList" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="name" label="Event Name" required :error="validName">
        <UInput
          v-model="eventName"
          color="gray"
          variant="outline"
          placeholder="Event Name"
          :disabled="disabled" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="slug" label="Slug" required :error="validSlug">
        <UInput
          v-model="eventSlug"
          color="gray"
          variant="outline"
          :disabled="disabled"
          placeholder="Slug" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="description" label="Event Description">
        <UTextarea
          v-model="eventDescription"
          color="gray"
          variant="outline"
          :disabled="disabled"
          placeholder="Event Description" />
      </UFormGroup>
      <UDivider />
      <UFormGroup name="image" label="Event Header Image" :error="validImage">
        <Upload
          label="Upload an Image"
          :disabled="disabled"
          @upload="uploaded" />
        <UButton
          label="Remove Image"
          variant="link"
          :disabled="disabled"
          @click="() => (eventImage = '')" />
      </UFormGroup>
      <UDivider />
      <UFormGroup
        name="eventDate"
        label="Event Date"
        required
        :error="validEventDate">
        <div class="w-fit">
          <UPopover
            :popper="{ placement: 'bottom-start' }"
            :disabled="disabled">
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              :disabled="disabled">
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
          <UPopover
            :popper="{ placement: 'bottom-start' }"
            :disabled="disabled">
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              :disabled="disabled">
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
        <Tiptap v-if="!disabled" v-model="content" />
        <div
          v-else
          class="prose max-w-full dark:prose-invert focus:outline-none"
          v-html="content" />
      </UFormGroup>
    </div>

    <!-- <ModalDelete
      v-model="deleteModal"
      text="Are you sure you want to delete this event?"
      placeholder-text="Event Name"
      :input-match="eventName"
      @delete="deleteEvent" /> -->
  </div>
</template>
<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'
import slugify from 'slugify'

import { format } from 'date-fns'
import { ModalSave, ModalDelete } from '#components'
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
const { data: event } = await $client.eventsAdmin.getEvent.useQuery(Number(id))

useHead({
  title: event.value?.name ?? 'New Event' + ' - Edit',
})

const saving = ref(false)
const predictionsCloseDate = ref(event.value?.closeDate ?? new Date())
const eventDescription = ref(event.value?.description ?? '')
const eventImage = ref(event.value?.image ?? '')
const eventName = ref(event.value?.name ?? '')
const eventSlug = ref(event.value?.slug ?? '')
const content = ref(event.value?.information ?? '')
const status = ref(event.value?.status ?? 'DRAFT')
const disabled = computed(() => {
  if (status.value === 'FINISHED') {
    return true
  }
  return false
})

const statusList = ['DRAFT', 'PUBLISHED', 'FINISHED']
const eventDate = ref({
  start: event.value?.startDate ?? new Date(),
  end: event.value?.endDate ?? new Date(),
})

// eslint-disable-next-line camelcase
const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown') e.preventDefault()
  },
})

whenever(ctrl_s, () => {
  if (saveEnabled.value) saveEvent()
})

const modal = useModal()
onBeforeRouteLeave((_to, _from, next) => {
  if (saveEnabled.value) {
    modal.open(ModalSave, {
      text: 'You have unsaved changes!',
      close: () => {
        modal.close()
        next()
      },
      save: async () => {
        await saveEvent()
        modal.close()
        next()
      },
      icon: 'carbon:warning',
    })
  } else next()
})

watchDeep(
  [
    event,
    eventName,
    eventImage,
    eventDate,
    predictionsCloseDate,
    eventDescription,
    status,
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
      slug: eventSlug.value || '',
      information: content.value || '',
      status: status.value || 'DRAFT',
    })

    if (mutate) {
      saving.value = false
      saveEnabled.value = false
      toast.add({ title: 'Event Saved Successfully!' })
    }
  }
}

async function deleteEvent() {
  saving.value = true
  const mutate = await $client.eventsAdmin.deleteEvent.mutate(Number(id))
  if (mutate) {
    navigateTo('/admin/event')
  }
}
const toast = useToast()

function uploaded(data: Ref<UploadApiResponse>) {
  eventImage.value = `${data.value.public_id}.${data.value.format}`
}

function openDeleteModal() {
  modal.open(ModalDelete, {
    text: 'Are you sure you want to delete this event?',
    placeholderText: 'Event Name',
    inputMatch: eventName.value ?? '',
    deleteFn: async () => {
      await deleteEvent()
      modal.close()
    },
  })
}
</script>
