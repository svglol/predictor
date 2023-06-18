<template>
  <div>
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="i-heroicons-pencil-square"
        :disabled="!saveEnabled"
        @click="saveEvent"
      >
        Save
      </UButton>
    </div>
    <div class="flex flex-col space-y-2">
      <template v-for="section in sections" :key="section.id">
        <AdminEventResultSection
          :section="section"
          @update-section="updateSection"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { Prisma } from "@prisma/client"

definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route: { params: { id: any } }) => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEventResults.useQuery(
  Number(id)
)

useHead({
  title: event.value?.name + " - Results",
})

if (event.value && event.value.sections.length > 0)
  useGetResult(event.value.sections[0].questions[0])

const sections = ref(event.value?.sections ?? [])

const saving = ref(false)
const saveEnabled = ref(false)

watchDeep([event], () => {
  saveEnabled.value = true
})

watchDebounced(
  [event],
  () => {
    saveEvent()
  },
  { debounce: 2000, maxWait: 2000, deep: true }
)

async function saveEvent() {
  saving.value = true
  const updates: unknown[] = []
  sections.value.forEach(async (section: SectionWithQuestion) => {
    section.questions?.forEach(async (question: QuestionWithResultOption) => {
      updates.push(
        $client.events.updateQuestionResults.mutate({
          id: question.id,
          resultString: question.resultString,
          resultBoolean: question.resultBoolean,
          resultNumber: question.resultNumber,
          optionId: question.optionId,
        })
      )
    })
  })
  const results = await Promise.all(updates)
  if (results) {
    saving.value = false
    saveEnabled.value = false
    const toast = useToast()
    toast.add({ title: "Results Saved Successfully!" })
  }
}
function updateSection(updatedSection: SectionWithQuestion) {
  if (event.value) {
    const sectionIndex = event.value.sections.findIndex(
      (section: SectionWithQuestion) => section.id === updatedSection.id
    )
    event.value.sections[sectionIndex] = updatedSection
  }
}
</script>

<style scoped></style>
