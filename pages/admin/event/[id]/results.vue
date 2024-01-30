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
  const mutate = await $client.eventsAdmin.updateQuestionResults.mutate(
    difference.value.map(question => ({
      id: question.id,
      resultBoolean: question.resultBoolean,
      resultNumber: question.resultNumber,
      resultString: question.resultString,
      optionId: question.resultOption,
    }))
  )
  if (mutate) {
    await $client.eventsAdmin.updateScores.mutate(event.value?.id ?? 0)
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
          updatedResults += `\n*${getResult(question)}*`
        }
      }
    }
    if (updatedResults.length > 0) {
      await $client.webhook.sendMessage.mutate({
        title: event.value?.name ?? '',
        description: `## 🔔 ***Results Updated*** ${updatedResults}`,
        url: `${useRuntimeConfig().public.authJs.baseUrl}/event/${
          event.value?.id
        }?tab=Results`,
        thumbnail: `https://res.cloudinary.com/dme6x6ch5/image/upload/${event.value?.image}`,
      })
      postStandings()
    }
    origSections = JSON.parse(JSON.stringify(event.value?.sections))
    saving.value = false
    saveEnabled.value = false
  }
  autosave = false
}
function updateSection(updatedSection: EventSectionWithQuestions) {
  if (event.value) {
    const sectionIndex = event.value.sections.findIndex(
      section => section.id === updatedSection.id
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
    url: `${useRuntimeConfig().public.authJs.baseUrl}/event/${
      event.value?.id
    }?tab=Points`,
    thumbnail: `https://res.cloudinary.com/dme6x6ch5/image/upload/${event.value?.image}`,
  })
}

const original = computed(() => {
  return (
    origSections
      .map(obj => obj.questions)
      .flat()
      .map(question => {
        return {
          id: question.id,
          eventSectionId: question.eventSectionId,
          question: question.question,
          type: question.type,
          resultBoolean: question.resultBoolean,
          resultNumber: question.resultNumber,
          resultOption: question.optionId,
          resultString: question.resultString,
        }
      }) ?? []
  )
})

const updated = computed(() => {
  return event.value?.sections
    .map(obj => obj.questions)
    .flat()
    .map(question => {
      return {
        id: question.id,
        eventSectionId: question.eventSectionId,
        question: question.question,
        type: question.type,
        resultBoolean: question.resultBoolean,
        resultNumber: question.resultNumber,
        resultOption: question.optionId,
        resultString: question.resultString,
      }
    })
})

const difference = computed(() => {
  return (
    updated.value?.filter(x => {
      const orig = original.value.find(y => y.id === x.id)
      if (x.type === 'MULTI') {
        return x.resultOption !== orig?.resultOption ?? undefined
      } else if (x.type === 'TEXT') {
        return x.resultString !== orig?.resultString ?? undefined
      } else if (x.type === 'NUMBER') {
        return x.resultNumber !== orig?.resultNumber ?? undefined
      } else if (x.type === 'BOOLEAN') {
        return x.resultBoolean !== orig?.resultBoolean ?? undefined
      } else if (x.type === 'TIME') {
        return x.resultString !== orig?.resultString ?? undefined
      }
    }) ?? []
  )
})

const getResult = (question: ImmutableObject<questionWithResult> | null) => {
  if (!question) return 'None'
  switch (question.type) {
    case 'TEXT':
      return question.resultString ?? 'None'
    case 'BOOLEAN':
      if (
        question.resultBoolean === undefined ||
        question.resultBoolean === null
      )
        return 'None'
      if (question.resultBoolean) return 'Yes'
      else return 'No'
    case 'NUMBER':
      return question.resultNumber ?? 'None'
    case 'TIME':
      return question.resultString ?? 'None'
    case 'MULTI': {
      if (question.optionId) {
        return (
          question.optionSet?.options.find(
            option => option.id === question.optionId
          )?.title ?? 'None'
        )
      }
      return 'None'
    }
    default:
      return 'None'
  }
}
</script>
