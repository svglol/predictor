<template>
  <div class="space-y-2">
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="i-heroicons-pencil-square"
        :disabled="!saveEnabled"
        @click="saveEvent">
        Save
      </UButton>
      <UButton icon="i-heroicons-arrow-path" @click="reset">Reset</UButton>
    </div>
    <div class="flex flex-col space-y-4">
      <AdminEventResultSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
        @update-section="updateSection" />
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

const route = useRoute()
const id = route.params.id

const { $client, $bus } = useNuxtApp()
const { data: event } = await $client.events.getEventResults.useQuery(
  Number(id)
)

useHead({
  title: event.value?.name + ' - Results',
})

const sections = ref(event.value?.sections ?? [])

const saving = ref(false)
const saveEnabled = ref(false)

watchDeep([event], () => {
  saveEnabled.value = true
})

let autosave = false

async function saveEvent() {
  saving.value = true
  const mutate = await $client.events.updateSectionResults.mutate(
    sections.value
  )
  if (mutate) {
    await $client.events.updateScores.mutate(event.value?.id ?? 0)
  }
  const toast = useToast()
  if (!autosave && mutate) {
    toast.add({ title: 'Results Saved Successfully!' })
  }
  if (mutate) {
    await $client.webhook.sendMessage.mutate({
      title: event.value?.name ?? '',
      description: '🔔 ***Results Updated***',
      url:
        useRuntimeConfig().public.authJs.baseUrl + '/event/' + event.value?.id,
    })
    saving.value = false
    saveEnabled.value = false
  }
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
  $bus.$emit('resetQuestion', {})
}
</script>
