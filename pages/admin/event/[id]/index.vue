<template>
  <div v-if="event">
    <div class="flex flex-col">
      <AdminEventHeader :title="eventName">
        <UButton
          :loading="saving"
          icon="material-symbols:save"
          :disabled="!saveEnabled || !valid"
          @click="saveEvent"
        >
          Save
        </UButton>
        <UButton
          :loading="saving"
          :disabled="
            session?.user.role !== 'ADMIN' || event?.status === 'PUBLISHED'
          "
          icon="material-symbols:delete-outline"
          @click="openDeleteModal"
        >
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
            hide-edit
          />
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
            :disabled="disabled"
          />
        </UFormGroup>
        <UDivider />
        <UFormGroup name="slug" label="Slug" required :error="validSlug">
          <UInput
            v-model="eventSlug"
            color="gray"
            variant="outline"
            :disabled="disabled"
            placeholder="Slug"
          />
        </UFormGroup>
        <UDivider />
        <UFormGroup name="description" label="Event Description">
          <UTextarea
            v-model="eventDescription"
            color="gray"
            variant="outline"
            :disabled="disabled"
            placeholder="Event Description"
          />
        </UFormGroup>
        <UDivider />
        <UFormGroup name="image" label="Event Header Image" :error="validImage">
          <UIUpload
            label="Upload an Image"
            :disabled="disabled"
            @upload="uploaded"
          />
          <UButton
            label="Remove Image"
            variant="link"
            :disabled="disabled"
            @click="() => (eventImage = '')"
          />
        </UFormGroup>
        <UDivider />
        <UFormGroup
          name="eventDate"
          label="Event Date"
          required
          :error="validEventDate"
        >
          <div class="w-fit">
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              :disabled="disabled"
            >
              <UButton
                icon="i-heroicons-calendar-days-20-solid"
                :disabled="disabled"
              >
                {{ format(eventDate.start, 'd MMM, yyy hh:mm a') }} -
                {{ format(eventDate.end, 'd MMM, yyy hh:mm a') }}
              </UButton>

              <template #panel>
                <UIDatePicker v-model="eventDate" />
              </template>
            </UPopover>
          </div>
        </UFormGroup>
        <UDivider />
        <UFormGroup
          name="predictionsCloseDate"
          label="Predictions Close Date"
          :error="validCloseDate"
          required
        >
          <div class="w-fit">
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              :disabled="disabled"
            >
              <UButton
                icon="i-heroicons-calendar-days-20-solid"
                :disabled="disabled"
              >
                {{ format(predictionsCloseDate, 'd MMM, yyy hh:mm a') }}
              </UButton>

              <template #panel>
                <UIDatePicker v-model="predictionsCloseDate" />
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
            v-html="content"
          />
        </UFormGroup>
      </div>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'
import slugify from 'slugify'

import { format } from 'date-fns'
import { ModalDelete, ModalSave } from '#components'

const { session } = useAuth()

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  pageTransition: false,
})

const route = useRoute()
const id = route.params.id

const { data: event } = await useClient().eventsAdmin.getEvent.useQuery(Number(id))

useHead({
  title: computed(() => `${event.value?.name ?? 'New Event'} - Edit`),
})

const saving = ref(false)
const predictionsCloseDate = ref(new Date())
const eventDescription = ref('')
const eventImage = ref('')
const eventName = ref('')
const eventSlug = ref('')
const content = ref('')
const status = ref('DRAFT')
const saveEnabled = ref(false)

const toast = useToast()

const disabled = computed(() => {
  return status.value === 'FINISHED'
})

const statusList = ['DRAFT', 'PUBLISHED', 'FINISHED']
const eventDate = ref({
  start: new Date(),
  end: new Date(),
})

const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown')
      e.preventDefault()
  },
})

whenever(ctrl_s, () => {
  if (saveEnabled.value)
    saveEvent()
})

const modal = useModal()

onBeforeRouteLeave((_to, _from, next) => {
  if (saveEnabled.value) {
    modal.open(ModalSave, {
      text: 'You have unsaved changes!',
      close: () => {
        window.removeEventListener('beforeunload', handler)
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
  }
  else {
    window.removeEventListener('beforeunload', handler)
    next()
  }
})

onMounted(() => {
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
    },
  )

  watchEffect(() => {
    if (saveEnabled.value)
      window.addEventListener('beforeunload', handler)
  })
})

function handler(e: BeforeUnloadEvent) {
  e.preventDefault()
  e.returnValue = ''
}

watch(() => event.value, (newEvent) => {
  if (newEvent) {
    eventDescription.value = newEvent.description ?? ''
    eventImage.value = newEvent.image ?? ''
    eventName.value = newEvent.name ?? ''
    eventSlug.value = newEvent.slug ?? ''
    content.value = newEvent.information ?? ''
    status.value = newEvent.status ?? 'DRAFT'
    eventDate.value = {
      start: newEvent.startDate ?? new Date(),
      end: newEvent.endDate ?? new Date(),
    }
    predictionsCloseDate.value = newEvent.closeDate ?? new Date()
  }
}, { immediate: true })

watch(eventDate, (newVal) => {
  if (predictionsCloseDate.value > newVal.start)
    predictionsCloseDate.value = newVal.start
})

watch(eventName, () => {
  if (eventSlug.value.length === 0 || eventSlug.value === slugify(eventName.value, { lower: true }))
    eventSlug.value = slugify(eventName.value, { lower: true })
})

const validName = computed(() => {
  if (!eventName.value)
    return undefined
  return eventName.value.length === 0 ? 'Name is Required!' : undefined
})

const validSlug = computed(() => {
  if (!eventSlug.value)
    return undefined
  if (eventSlug.value.length === 0)
    return 'Slug is Required!'

  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(eventSlug.value))
    return 'Slug is not valid!'

  return undefined
})

const validEventDate = computed(() => {
  if (!eventDate.value.start || !eventDate.value.end)
    return undefined
  return eventDate.value.end < eventDate.value.start
    ? 'End Date must be after Start Date!'
    : undefined
})

const validCloseDate = computed(() => {
  if (!predictionsCloseDate.value || !eventDate.value.start)
    return undefined
  return predictionsCloseDate.value > eventDate.value.start
    ? 'Predictions Close Date must be before Event Start Date!'
    : undefined
})

const validImage = computed(() => {
  if (!eventImage.value)
    return undefined
  return !isImage(eventImage.value) ? 'Image is not valid url' : undefined
})

const valid = computed(() => {
  return (
    validName.value === undefined
    && validSlug.value === undefined
    && validEventDate.value === undefined
    && validCloseDate.value === undefined
    && validImage.value === undefined
  )
})

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate = await useClient().eventsAdmin.updateEventDetails.mutate({
      id: Number(id),
      name: eventName.value || '',
      description: eventDescription.value || '',
      image: eventImage.value || '',
      startDate: eventDate.value.start,
      endDate: eventDate.value.end,
      closeDate: predictionsCloseDate.value,
      slug: eventSlug.value || '',
      information: content.value || '',
      status: status.value as 'DRAFT' | 'PUBLISHED' | 'FINISHED',
    })

    if (mutate) {
      saving.value = false
      saveEnabled.value = false
      toast.add({ title: 'Event Saved Successfully!' })
      window.removeEventListener('beforeunload', handler)
    }
  }
}

async function deleteEvent() {
  saving.value = true
  const mutate = await useClient().eventsAdmin.deleteEvent.mutate(Number(id))
  if (mutate)
    navigateTo('/admin/event')
}

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
