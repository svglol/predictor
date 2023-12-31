<template>
  <div class="py-2">
    <UTable
      class="max-w-full rounded-lg border border-gray-200 bg-white p-0 shadow dark:prose-invert focus:outline-none dark:border-gray-700 dark:bg-gray-800 md:p-6"
      :columns="breakPointColumns"
      :rows="data"
      :sort="{ column: 'rank', direction: 'asc' }">
      <template #name-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.name.image" :alt="row.name.name" />
          <span class="font-semibold">{{ row.name.name }}</span>
        </div>
      </template>
      <template #rank-data="{ row }">
        <div class="flex items-center">
          <span class="text-2xl">{{ getEmoji(row.rank) }}</span>
          <span :class="getClass(row.rank)">
            {{ useGetOrdinalSuffix(row.rank) }}
          </span>
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

import { breakpointsTailwind } from '@vueuse/core'

//create columns
const columns = ref([
  {
    key: 'rank',
    label: 'Rank',
    sortable: true,
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'total_score',
    label: 'Total Score',
    sortable: true,
  },
])

const sectionsColumns = event.value?.sections.map(section => {
  return {
    key: section.heading ?? '',
    label: section.heading ?? '',
    sortable: true,
  }
})

const mobileColumns = ref(columns.value)
if (sectionsColumns)
  columns.value = columns.value
    .slice(0, 2)
    .concat(sectionsColumns, columns.value.slice(2))

const breakPointColumns = ref(columns.value)
const breakpoints = useBreakpoints(breakpointsTailwind)
const sm = breakpoints.smallerOrEqual('sm')

function updateColumns() {
  if (sm.value) {
    breakPointColumns.value = mobileColumns.value
  } else {
    breakPointColumns.value = columns.value
  }
}
updateColumns()
watch(sm, () => {
  updateColumns()
})

//create data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: Ref<any[]> = ref([])
event.value?.entries.forEach(entry => {
  const sectionPoints: { name: string; score: number }[] = []
  entry.entrySections.forEach(section => {
    sectionPoints.push({
      name:
        event.value?.sections.find(s => s.id === section.sectionId)?.heading ??
        '',
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

function everyQuestionHasResult() {
  let result = true
  event.value?.sections.forEach(section => {
    section.questions.forEach(question => {
      let questionResult = true
      switch (question.type) {
        case 'BOOLEAN':
          if (question.resultBoolean === null) {
            questionResult = false
          }
          break
        case 'NUMBER':
          if (question.resultNumber === null) {
            questionResult = false
          }
          break
        case 'TEXT':
          if (question.resultString === null) {
            questionResult = false
          }
          break
        case 'TIME':
          if (question.resultString === null) {
            questionResult = false
          }
          break
        case 'MULTI':
          if (question.optionId === null) {
            questionResult = false
          }
          break
      }
      if (!questionResult) {
        result = false
      }
    })
  })
  return result
}

function getEmoji(position: number) {
  if (everyQuestionHasResult()) {
    switch (position) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return '🏆'
    }
  }
}

function getClass(position: number) {
  if (everyQuestionHasResult()) {
    switch (position) {
      case 1:
        return 'font-bold text-yellow-500'
      case 2:
        return 'font-bold'
      case 3:
        return 'font-bold text-amber-800'
      default:
        return ''
    }
  }
}
</script>
