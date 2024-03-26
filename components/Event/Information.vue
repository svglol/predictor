<template>
  <div
    v-if="showConfetti"
    v-confetti="{
      particleCount: 150,
      particleSize: 8,
      stageHeight: 2160,
      force: 0.3,
    }"
    class="mx-auto size-0"
  />
  <div class="grid grid-flow-row grid-cols-2 gap-6">
    <UCard
      v-if="everyQuestionHasResult()"
      class="col-span-2"
      :ui="{
        background: 'bg-gray-100/50 dark:bg-gray-800/20',
        header: {
          background: 'bg-gray-200/50 dark:bg-gray-700/20',
          padding: 'p-3',
        },
        divide: 'divide-y-0',
        ring: 'ring-0',
      }"
    >
      <template #header>
        <h2
          class="text-center text-lg font-bold text-gray-700 dark:text-gray-300"
        >
          Final Standings
        </h2>
      </template>
      <EventPodium :event="event" />
    </UCard>
    <UCard
      v-if="everyQuestionHasResult()"
      :ui="{
        background: 'bg-gray-100/50 dark:bg-gray-800/20',
        header: {
          background: 'bg-gray-200/50 dark:bg-gray-700/20',
          padding: 'p-3',
        },
        divide: 'divide-y-0',
        ring: 'ring-0',
      }"
      class="col-span-2"
    >
      <template #header>
        <h2
          class="text-center text-lg font-bold text-gray-700 dark:text-gray-300"
        >
          Standings Graph
        </h2>
      </template>
      <EventScoreGraph :event="event" />
    </UCard>
    <UCard
      v-if="event?.information"
      class="col-span-2 md:col-span-1"
      :ui="{
        background: 'bg-gray-100/50 dark:bg-gray-800/20',
        header: {
          background: 'bg-gray-200/50 dark:bg-gray-700/20',
          padding: 'p-3',
        },
        divide: 'divide-y-0',
        ring: 'ring-0',
      }"
    >
      <template #header>
        <h2
          class="text-center text-lg font-bold text-gray-700 dark:text-gray-300"
        >
          Event Information
        </h2>
      </template>
      <div
        class="prose max-w-full dark:prose-invert focus:outline-none"
        v-html="event.information"
      />
    </UCard>
    <UCard
      :ui="{
        background: 'bg-gray-100/50 dark:bg-gray-800/20',
        header: {
          background: 'bg-gray-200/50 dark:bg-gray-700/20',
          padding: 'p-3',
        },
        divide: 'divide-y-0',
        ring: 'ring-0',
      }"
      class="col-span-2 md:col-span-1"
    >
      <template #header>
        <h2
          class="text-center text-lg font-bold text-gray-700 dark:text-gray-300"
        >
          {{ event?.entries.length ?? 0 }} Entrants
        </h2>
      </template>
      <EventEntrants :event="event" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { vConfetti } from '@neoconfetti/vue'

const { event } = $defineProps<{
  event: PredictorEvent | null
}>()
const { session } = useAuth()

function everyQuestionHasResult() {
  let result = true
  event?.sections.forEach((section) => {
    section.questions.forEach((question) => {
      let questionResult = true
      switch (question.type) {
        case 'BOOLEAN':
          if (question.resultBoolean === null)
            questionResult = false

          break
        case 'NUMBER':
          if (question.resultNumber === null)
            questionResult = false

          break
        case 'TEXT':
          if (question.resultString === null)
            questionResult = false

          break
        case 'TIME':
          if (question.resultString === null)
            questionResult = false

          break
        case 'MULTI':
          if (question.optionId === null)
            questionResult = false

          break
      }
      if (!questionResult)
        result = false
    })
  })
  return result
}

const confettiShown = useState(`confetti-${event?.id}`, () => false)

const podiumData = computed(() => {
  if (!event)
    return []
  const entries = event.entries
    .map(entry => ({
      user: entry.user,
      rank: entry.rank,
    }))
    .filter(entry => entry.rank <= 3)
    .sort((a, b) => a.rank - b.rank)

  return entries.flatMap(entry => entry.user)
})

const showConfetti = computed(() => {
  if (everyQuestionHasResult()) {
    if (
      podiumData.value.filter(d => d.name === session.value?.user.name)
        .length > 0
    ) {
      if (!confettiShown.value)
        return true
    }
  }
  return false
})

onMounted(() => {
  setTimeout(() => {
    if (showConfetti.value)
      confettiShown.value = true
  }, 3000)
})
</script>
