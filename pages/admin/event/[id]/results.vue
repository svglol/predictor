<template>
  <div class="space-y-2">
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="material-symbols:save"
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
let origSections: SectionWithQuestion[] = JSON.parse(
  JSON.stringify(event.value?.sections)
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
    let updatedResults = ''
    for (const section of sections.value) {
      let sectionTitleAdded = false
      for (const question of section.questions) {
        const origQuestion = origSections
          .find(s => s.id === section.id)
          ?.questions.find(q => q.id === question.id)
        if (JSON.stringify(question) !== JSON.stringify(origQuestion)) {
          if (!sectionTitleAdded) {
            updatedResults += `\n### ${section.heading}`
            sectionTitleAdded = true
          }
          updatedResults += `\n**${question.question}**`
          updatedResults += `\n*${useGetResult(question)}*`
        }
      }
    }
    if (updatedResults.length > 0) {
      await $client.webhook.sendMessage.mutate({
        title: event.value?.name ?? '',
        description: `## 🔔 ***Results Updated*** ${updatedResults}`,
        url: `${useRuntimeConfig().public.authJs.baseUrl}/event/${event.value
          ?.id}?tab=Results`,
        thumbnail: event.value?.image ?? '',
      })
      postStandings()
    }
    origSections = JSON.parse(JSON.stringify(event.value?.sections))
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

async function postStandings() {
  const { data: eventWithEntries } = await $client.events.getEvent.useQuery(
    Number(id)
  )
  const data: Ref<any[]> = ref([])
  eventWithEntries.value?.entries.forEach(entry => {
    const sectionPoints: { name: string; score: number }[] = []
    entry.entrySections.forEach(section => {
      sectionPoints.push({
        name:
          event.value?.sections.find(s => s.id === section.sectionId)
            ?.heading ?? '',
        score: section.sectionScore,
      })
    })

    const sectionPointsObj = sectionPoints.reduce((accumulator, value) => {
      return { ...accumulator, [value.name]: value.score }
    }, {})
    const total = sectionPoints.reduce((a, b) => a + b.score, 0)
    data.value.push({
      rank: entry.rank,
      name: { name: entry.user.name, image: entry.user.image },
      ...sectionPointsObj,
      total_score: total,
    })
  })
  data.value.sort((a, b) => b.total_score - a.total_score)
  let standingsText = ''
  for (const user of data.value) {
    standingsText += `\n${useGetOrdinalSuffix(user.rank)} ${user.name.name} - ${
      user.total_score
    } Points`
  }
  await $client.webhook.sendMessage.mutate({
    title: event.value?.name ?? '',
    description: `## 🏆 ***Points Updated***\n${standingsText}`,
    url: `${useRuntimeConfig().public.authJs.baseUrl}/event/${event.value
      ?.id}?tab=Points`,
    thumbnail: event.value?.image ?? '',
  })
}
</script>
