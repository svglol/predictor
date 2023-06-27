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
      <UButton icon="i-heroicons-arrow-path" @click="reset">Reset</UButton>
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
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client, $bus } = useNuxtApp()
const { data: event } = await $client.events.getEventResults.useQuery(
  Number(id)
)

useHead({
  title: event.value?.name + " - Results",
})

const sections = ref(event.value?.sections ?? [])

const saving = ref(false)
const saveEnabled = ref(false)

watchDeep([event], () => {
  saveEnabled.value = true
})

let autosave = false
watchDebounced(
  [event],
  () => {
    autosave = true
    saveEvent()
  },
  { debounce: 2000, maxWait: 2000, deep: true }
)

async function saveEvent() {
  saving.value = true

  for (const section of sections.value) {
    for (const question of section.questions) {
      await $client.events.updateQuestionResults.mutate({
        id: question.id,
        resultString: question.resultString,
        resultBoolean: question.resultBoolean,
        resultNumber: question.resultNumber,
        optionId: question.optionId,
      })
    }
  }
  saving.value = false
  saveEnabled.value = false
  const toast = useToast()
  if (!autosave) {
    toast.add({ title: "Results Saved Successfully!" })
  }
  $client.events.updateScores.mutate(event.value?.id ?? 0)
  autosave = false
}
function updateSection(updatedSection: Section) {
  if (event.value) {
    const sectionIndex = event.value.sections.findIndex(
      (section: SectionWithQuestion) => section.id === updatedSection.id
    )
    event.value.sections[sectionIndex] = updatedSection
  }
}

function reset() {
  $bus.$emit("resetQuestion", {})
}
</script>

<style scoped></style>
