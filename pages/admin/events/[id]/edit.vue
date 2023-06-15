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
        @click="deleteModal = true"
      >
        Delete
      </UButton>
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
import { Prisma } from "@prisma/client"

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

useHead({
  title: event.value?.name + " - Edit",
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
const event_name = ref(event.value?.name ?? "")
const sections = ref(event.value?.sections ?? [])

watchDeep(
  [
    event,
    event_name,
    event_start_date,
    event_end_date,
    predictions_close_date,
    sections,
  ],
  () => {
    saveEnabled.value = true
  }
)

watchDeep(sections, () => {
  sections.value.forEach((section, i) => {
    section.order = i
  })
})

const saveEnabled = ref(false)

watchDebounced(
  [
    event,
    event_name,
    event_start_date,
    event_end_date,
    predictions_close_date,
    sections,
  ],
  () => {
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
      event_start_date: new Date(event_start_date.value),
      event_end_date: new Date(event_end_date.value),
      predictions_close_date: new Date(predictions_close_date.value),
    })

    sections.value.forEach((section) => {
      $client.events.updateSection.mutate({
        id: section.id,
        heading: section.heading ?? "",
        description: section.description ?? "",
        order: section.order ?? 0,
      })

      section.questions?.forEach((question) => {
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
    }
  }
}

async function deleteEvent() {
  deleteModal.value = false
  saving.value = true
  const mutate = await $client.events.deleteEvent.mutate(Number(id))
  if (mutate) {
    navigateTo("/admin/events")
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
      (section) => section.id !== sectionId
    )
  }
}

const eventWithQuestion = Prisma.validator<Prisma.EventSectionArgs>()({
  include: { questions: { include: { resultOption: true } } },
})
type EventWithQuestion = Prisma.EventSectionGetPayload<typeof eventWithQuestion>

async function updateSection(updatedSection: EventWithQuestion) {
  if (event.value) {
    const sectionIndex = sections.value.findIndex(
      (section) => section.id === updatedSection.id
    )
    sections.value[sectionIndex] = updatedSection
  }
}
</script>
