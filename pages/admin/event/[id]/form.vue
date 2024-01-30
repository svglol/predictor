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
    </div>
    <div class="flex flex-col gap-2">
      <UFormGroup name="sections" label="Sections">
        <div class="flex flex-col space-y-2">
          <SlickList v-model:list="sections" axis="y" :use-drag-handle="true">
            <SlickItem
              v-for="(section, i) in sections"
              :key="section.id"
              :index="i"
              class="my-2">
              <AdminEventEditSection
                :section="section"
                :option-sets="optionSets"
                :disabled="visible"
                @delete-section="deleteSection"
                @update-section="updateSection" />
            </SlickItem>
          </SlickList>
          <div class="flex flex-row-reverse">
            <UButton
              icon="i-heroicons-plus"
              :disabled="visible"
              @click="addSection">
              Add Section
            </UButton>
          </div>
        </div>
      </UFormGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin-event',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const toast = useToast()
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))
const { data: optionSets } =
  await $client.events.getOptionSetsForEvent.useQuery({ eventId: Number(id) })
useHead({
  title: event.value?.name ?? 'New Event' + ' - Form',
})

const sections = ref(event.value?.sections ?? [])
const visible = ref(event.value?.visible ?? false)
const saving = ref(false)
const valid = ref(true)
const saveEnabled = ref(false)
let autosave = false

onMounted(() => {
  watchDeep(sections, () => {
    sections.value.forEach((section, i) => {
      section.order = i
    })
  })

  watchDebounced(
    [sections],
    () => {
      autosave = true
      saveEvent()
    },
    { debounce: 2000, maxWait: 2000, deep: true }
  )
})

watchDeep([sections], () => {
  saveEnabled.value = true
})

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
    sections.value = sections.value.filter(section => section.id !== sectionId)
  }
}

async function updateSection(updatedSection: EventSectionWithQuestions) {
  if (event.value) {
    const sectionIndex = sections.value.findIndex(
      section => section.id === updatedSection.id
    )
    sections.value[sectionIndex] = updatedSection
  }
}

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate = await $client.events.updateEventSectionsQuestions.mutate({
      id: Number(id),
      sections: sections.value.map(section => {
        return {
          id: section.id,
          heading: section.heading ?? '',
          description: section.description ?? '',
          order: section.order ?? 0,
          questions: section.questions.map(question => {
            return {
              id: question.id,
              question: question.question ?? '',
              hint: question.hint ?? '',
              type: question.type ?? 'TEXT',
              optionSetId: question.optionSetId,
              order: question.order ?? 0,
              points: Number(question.points),
            }
          }),
        }
      }),
    })

    if (mutate) {
      await $client.events.updateScores.mutate(event.value?.id ?? 0)
      saving.value = false
      saveEnabled.value = false
      if (!autosave) {
        toast.add({ title: 'Event Saved Successfully!' })
      }
      autosave = false
    }
  }
}
</script>