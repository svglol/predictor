<template>
  <div>
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="i-heroicons-pencil-square"
        :disabled="!saveEnabled || !valid"
        @click="saveEvent"
      >
        Save
      </UButton>
      <UButton
        :loading="saving"
        icon="i-heroicons-trash"
        :disabled="disableDelete"
        @click="deleteModal = true"
      >
        Delete
      </UButton>
      <UButton
        v-if="visible"
        :icon="copyIcon"
        :disabled="copied"
        @click="copyInviteUrl"
        >Copy Invite</UButton
      >
    </div>
    <div class="flex flex-col space-y-2">
      <UFormGroup name="name" label="Event Name" required :error="validName">
        <UInput
          v-model="event_name"
          color="primary"
          variant="outline"
          placeholder="Event Name"
        />
      </UFormGroup>
      <UFormGroup name="description" label="Event Description">
        <UTextarea
          v-model="event_description"
          color="primary"
          variant="outline"
          placeholder="Event Description"
        />
      </UFormGroup>
      <UFormGroup
        name="eventStartDate"
        label="Event Start Date"
        required
        :error="validStartDate"
      >
        <UInput
          v-model="eventStartDate"
          color="primary"
          variant="outline"
          type="datetime-local"
        />
      </UFormGroup>
      <UFormGroup
        name="eventEndDate"
        label="Event End Date"
        required
        :error="validEndDate"
      >
        <UInput
          v-model="eventEndDate"
          color="primary"
          variant="outline"
          type="datetime-local"
          :min="eventStartDate"
        />
      </UFormGroup>
      <UFormGroup
        name="predictionsCloseDate"
        label="Predictions Close Date"
        required
        :error="validCloseDate"
      >
        <UInput
          v-model="predictionsCloseDate"
          color="primary"
          variant="outline"
          type="datetime-local"
          :max="eventStartDate"
        />
      </UFormGroup>
      <div class="flex flex-col">
        <UCheckbox
          v-model="visible"
          label="Enable Predictions"
          :disabled="event.entries.length > 0"
        />
        <span class="text-xs"
          >This will lock everything in sections except for points & make the
          event visible</span
        >
      </div>
      <UFormGroup name="sections" label="Sections">
        <div class="flex flex-col space-y-2">
          <SlickList v-model:list="sections" axis="y" :use-drag-handle="true">
            <SlickItem
              v-for="(section, i) in sections"
              :key="section.id"
              :index="i"
              class="my-2"
            >
              <AdminEventEditSection
                :section="section"
                :option-sets="optionSets"
                :disabled="visible"
                @delete-section="deleteSection"
                @update-section="updateSection"
              />
            </SlickItem>
          </SlickList>
          <div class="flex flex-row-reverse">
            <UButton icon="i-heroicons-plus" @click="addSection">
              Add Section
            </UButton>
          </div>
        </div>
      </UFormGroup>
    </div>

    <DeleteModal
      v-model="deleteModal"
      text="Are you sure you want to delete this event?"
      @delete-event="deleteEvent"
    />
  </div>
</template>
<script setup lang="ts">
import type { EventSection } from "@prisma/client"

definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))

const disableDelete = computed(() => {
  if (event.value) {
    if (event.value?._count.entries > 0) {
      return true
    }
  }
  return false
})

useHead({
  title: event.value?.name ?? "New Event" + " - Edit",
})

const { data: optionSets } = await $client.events.getOptionSets.useQuery()
const saving = ref(false)
const valid = ref(true)
const deleteModal = ref(false)
const eventStartDate = ref(" ")
const eventEndDate = ref(" ")
const predictionsCloseDate = ref(" ")
const event_description = ref(event.value?.description ?? "")
const event_name = ref(event.value?.name ?? "")
const sections = ref(event.value?.sections ?? [])
const visible = ref(event.value.visible ?? false)
if (event.value.entries.length > 0) {
  visible.value = true
}

onMounted(() => {
  eventStartDate.value = convertTimeToLocal(event.value.startDate)
  eventEndDate.value = convertTimeToLocal(event.value.endDate)
  predictionsCloseDate.value = convertTimeToLocal(
    event.value.predictionsCloseDate
  )
})

watchDeep(event_name, () => {
  useHead({
    title: event_name.value ?? "New Event" + " - Edit",
  })
})

watchDeep(
  [
    event,
    event_name,
    eventStartDate,
    eventEndDate,
    predictionsCloseDate,
    event_description,
    sections,
    visible,
  ],
  () => {
    saveEnabled.value = true
  }
)

watchDeep(sections, () => {
  sections.value.forEach((section: SectionWithQuestion, i: number) => {
    section.order = i
  })
})

const saveEnabled = ref(false)
let autosave = false

watchDebounced(
  [
    event,
    event_name,
    eventStartDate,
    eventEndDate,
    predictionsCloseDate,
    sections,
    event_description,
    visible,
  ],
  () => {
    autosave = true
    saveEvent()
  },
  { debounce: 2000, maxWait: 2000, deep: true }
)

const validName = computedEager(() => {
  if (event_name.value.length === 0) {
    valid.value = false
    return "Name is Required!"
  }
  valid.value = true
})

const validStartDate = computedEager(() => {
  if (eventStartDate.value.length === 0) {
    valid.value = false
    return "Start Date is Required!"
  }
  if (new Date(eventStartDate.value) >= new Date(eventEndDate.value)) {
    valid.value = false
    return "Start Date must be before End Date!"
  }
  valid.value = true
})

const validEndDate = computedEager(() => {
  if (eventEndDate.value.length === 0) {
    valid.value = false
    return "End Date is Required!"
  }
  if (new Date(eventEndDate.value) <= new Date(eventStartDate.value)) {
    valid.value = false
    return "End Date must be after Start Date!"
  }
  valid.value = true
})

const validCloseDate = computedEager(() => {
  if (predictionsCloseDate.value.length === 0) {
    valid.value = false
    return "Predictions Close Date is Required!"
  }
  if (new Date(predictionsCloseDate.value) > new Date(eventStartDate.value)) {
    valid.value = false
    return "Predictions Close Date must be before Start Date!"
  }
  valid.value = true
})

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate = await $client.events.updateEventSectionsQuestions.mutate({
      id: Number(id),
      name: event_name.value || "",
      description: event_description.value || "",
      event_start_date: convertTimeToUTC(eventStartDate.value),
      event_end_date: convertTimeToUTC(eventEndDate.value),
      predictions_close_date: convertTimeToUTC(predictionsCloseDate.value),
      visible: visible.value,
      sections: sections.value.map((section) => {
        return {
          id: section.id,
          heading: section.heading ?? "",
          description: section.description ?? "",
          order: section.order ?? 0,
          questions: section.questions.map((question) => {
            return {
              id: question.id,
              question: question.question ?? "",
              type: question.type ?? "TEXT",
              optionSetId: question.optionSetId,
              order: question.order ?? 0,
              points: Number(question.points),
            }
          }),
        }
      }),
    })
    if (mutate) {
      saving.value = false
      saveEnabled.value = false
      if (!autosave) {
        toast.add({ title: "Event Saved Successfully!" })
      }
      $client.events.updateScores.mutate(event.value?.id ?? 0)
      autosave = false
    }
  }
}

async function deleteEvent() {
  deleteModal.value = false
  saving.value = true
  const mutate = await $client.events.deleteEvent.mutate(Number(id))
  if (mutate) {
    navigateTo("/admin/event")
  }
}

async function addSection() {
  const section = await $client.events.addSection.mutate({
    eventId: Number(id),
    order: sections.value.length ?? 0,
  })
  if (section) {
    sections.value.push(section)
  }
}

async function deleteSection(sectionId: number) {
  const mutate = await $client.events.deleteSection.mutate(sectionId)
  if (mutate && event.value) {
    sections.value = sections.value.filter(
      (section: SectionWithQuestion) => section.id !== sectionId
    )
  }
}

async function updateSection(
  updatedSection: EventSection & { questions: Question[] }
) {
  if (event.value) {
    const sectionIndex = sections.value.findIndex(
      (section: SectionWithQuestion) => section.id === updatedSection.id
    )
    sections.value[sectionIndex] = updatedSection
  }
}
const url = useRequestURL()
const source = ref(url.origin + "/i/" + event.value?.inviteId ?? "")
const { copy, copied } = useClipboard({ source })
const toast = useToast()

const copyIcon = computed(() =>
  copied.value
    ? "i-heroicons-clipboard-document-check"
    : "i-heroicons-clipboard-document"
)

function copyInviteUrl() {
  copy(source.value)
  toast.add({ title: "Copied Invite Url!" })
}
</script>
