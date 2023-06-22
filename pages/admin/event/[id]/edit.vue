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
      <UButton :icon="copyIcon" :disabled="copied" @click="copyInviteUrl"
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
        name="event_start_date"
        label="Event Start Date"
        required
        :error="validStartDate"
      >
        <UInput
          v-model="event_start_date"
          color="primary"
          variant="outline"
          type="date"
        />
      </UFormGroup>
      <UFormGroup
        name="event_end_date"
        label="Event End Date"
        required
        :error="validEndDate"
      >
        <UInput
          v-model="event_end_date"
          color="primary"
          variant="outline"
          type="date"
        />
      </UFormGroup>
      <UFormGroup
        name="predictions_close_date"
        label="Predictions Close Date"
        required
        :error="validCloseDate"
      >
        <UInput
          v-model="predictions_close_date"
          color="primary"
          variant="outline"
          type="datetime-local"
        />
      </UFormGroup>
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
import type { Question } from "@prisma/client"

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
  title: event.value?.name ?? "" + " - Edit",
})

const { data: optionSets } = await $client.events.getOptionSets.useQuery()
const saving = ref(false)
const valid = ref(true)
const deleteModal = ref(false)
const event_start_date = ref(
  event.value?.event_start_date?.toISOString().slice(0, 10) ?? ""
)
const event_end_date = ref(
  event.value?.event_end_date?.toISOString().slice(0, 10) ?? ""
)
const predictions_close_date = ref(
  event.value?.predictions_close_date?.toISOString().slice(0, 19) ?? ""
)
const event_description = ref(event.value?.description ?? "")
const event_name = ref(event.value?.name ?? "")
const sections = ref(event.value?.sections ?? [])

watchDeep(
  [
    event,
    event_name,
    event_start_date,
    event_end_date,
    predictions_close_date,
    event_description,
    sections,
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
    event_start_date,
    event_end_date,
    predictions_close_date,
    sections,
    event_description,
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
  if (event_start_date.value.length === 0) {
    valid.value = false
    return "Start Date is Required!"
  }
  valid.value = true
})

const validEndDate = computedEager(() => {
  if (event_end_date.value.length === 0) {
    valid.value = false
    return "End Date is Required!"
  }
  valid.value = true
})

const validCloseDate = computedEager(() => {
  if (predictions_close_date.value.length === 0) {
    valid.value = false
    return "Predictions Close Date is Required!"
  }
  valid.value = true
})

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate = await $client.events.updateEvent.mutate({
      id: Number(id),
      name: event_name.value || "",
      description: event_description.value || "",
      event_start_date: new Date(event_start_date.value),
      event_end_date: new Date(event_end_date.value),
      predictions_close_date: new Date(predictions_close_date.value),
    })

    sections.value.forEach((section: SectionWithQuestion) => {
      $client.events.updateSection.mutate({
        id: section.id,
        heading: section.heading ?? "",
        description: section.description ?? "",
        order: section.order ?? 0,
      })

      section.questions?.forEach((question: Question) => {
        $client.events.updateQuestion.mutate({
          id: question.id,
          question: question.question ?? "",
          type: question.type ?? "TEXT",
          optionSetId: question.optionSetId,
          order: question.order ?? 0,
          points: Number(question.points),
        })
      })
    })
    if (mutate) {
      saving.value = false
      saveEnabled.value = false
      if (!autosave) {
        toast.add({ title: "Event Saved Successfully!" })
      }
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

async function updateSection(updatedSection: EventWithQuestion) {
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
