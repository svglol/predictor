<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="event?.name">
      <UButton
        :loading="saving"
        icon="material-symbols:save"
        :disabled="!saveEnabled || disabled"
        @click="saveEvent"
      >
        Save
      </UButton>
      <UButton
        icon="i-heroicons-arrow-path"
        :loading="saving"
        :disabled="disabled"
        @click="reset"
      >
        Reset
      </UButton>
    </AdminEventHeader>
    <div class="flex flex-col p-4">
      <AdminEventResultSection
        v-for="section in sections"
        :key="section.id"
        :disabled="disabled"
        :section="section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModalSave } from '#components'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})

const route = useRoute()
const id = route.params.id

const { data: event } = await useClient().eventsAdmin.getEventResults.useQuery(
  Number(id),
)

let origSections: SectionWithQuestion[] = JSON.parse(
  JSON.stringify(event.value?.sections ?? []),
)

useHead({
  title: `${event.value?.name} - Results`,
})

const sections = ref(event.value?.sections ?? [])

const saving = ref(false)
const saveEnabled = ref(false)

watchDeep([event], () => {
  saveEnabled.value = true
})

function handler(e: BeforeUnloadEvent) {
  e.preventDefault()
  e.returnValue = ''
}
watchEffect(() => {
  if (saveEnabled.value)
    window.addEventListener('beforeunload', handler)
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

const disabled = computed(() => {
  if (event.value?.status === 'FINISHED')
    return true

  return false
})

async function reset() {
  saving.value = true
  await useClient().eventsAdmin.resetResults.mutate(Number(id))
  sections.value.forEach((section) => {
    section.questions.forEach((question) => {
      question.resultBoolean = null
      question.resultNumber = null
      question.resultString = null
      question.optionId = null
    })
  })
  saving.value = false
}

async function postStandings() {
  const { data: eventWithEntries }
    = await useClient().eventsAdmin.getEvent.useQuery(Number(id))
  const data: Ref<any[]> = ref([])
  eventWithEntries.value?.entries.forEach((entry) => {
    const sectionPoints: { name: string, score: number }[] = []
    entry.entrySections.forEach((section) => {
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
  await useClient().webhook.sendMessage.mutate({
    title: event.value?.name ?? '',
    description: `## 🏆 ***Points Updated***\n${standingsText}`,
    url: `${useRuntimeConfig().public.authJs.baseUrl}/${
      event.value?.slug
    }?tab=points`,
    thumbnail: `https://res.cloudinary.com/dme6x6ch5/image/upload/${event.value?.image}`,
  })
}

const original = computed(() => {
  return (
    origSections
      .map(obj => obj.questions)
      .flat()
      .map((question) => {
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
    .map((question) => {
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
    updated.value?.filter((x) => {
      const orig = original.value.find(y => y.id === x.id)
      if (!orig)
        return false
      if (x.type === 'MULTI')
        return x.resultOption !== orig.resultOption
      else if (x.type === 'TEXT')
        return x.resultString !== orig.resultString
      else if (x.type === 'NUMBER')
        return x.resultNumber !== orig.resultNumber
      else if (x.type === 'BOOLEAN')
        return x.resultBoolean !== orig.resultBoolean
      else if (x.type === 'TIME')
        return x.resultString !== orig.resultString

      return false
    }) ?? []
  )
})

async function saveEvent() {
  saving.value = true
  const mutate = await useClient().eventsAdmin.updateQuestionResults.mutate(
    difference.value.map(question => ({
      id: question.id,
      resultBoolean: question.resultBoolean,
      resultNumber: question.resultNumber,
      resultString: question.resultString,
      optionId: question.resultOption,
    })),
  )
  if (mutate)
    await useClient().eventsAdmin.updateScores.mutate(event.value?.id ?? 0)

  const toast = useToast()
  if (mutate) {
    toast.add({ title: 'Results Saved Successfully!' })
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
      await useClient().webhook.sendMessage.mutate({
        title: event.value?.name ?? '',
        description: `## 🔔 ***Results Updated*** ${updatedResults}`,
        url: `${useRuntimeConfig().public.authJs.baseUrl}/${
          event.value?.slug
        }?tab=results`,
        thumbnail: `https://res.cloudinary.com/dme6x6ch5/image/upload/${event.value?.image}`,
      })
      postStandings()
    }
    origSections = JSON.parse(JSON.stringify(event.value?.sections))
    window.removeEventListener('beforeunload', handler)
    saving.value = false
    saveEnabled.value = false
  }
}

function getResult(question: ImmutableObject<questionWithResult> | null) {
  if (!question)
    return 'None'
  switch (question.type) {
    case 'TEXT':
      return question.resultString ?? 'None'
    case 'BOOLEAN':
      if (
        question.resultBoolean === undefined
        || question.resultBoolean === null
      )
        return 'None'
      if (question.resultBoolean)
        return 'Yes'
      else return 'No'
    case 'NUMBER':
      return question.resultNumber ?? 'None'
    case 'TIME':
      return question.resultString ?? 'None'
    case 'MULTI': {
      if (question.optionId) {
        return (
          question.optionSet?.options.find(
            option => option.id === question.optionId,
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
