<template>
  <div class="flex flex-col gap-6">
    <UTable
      :ui="{
        base: 'w-full',
        th: { color: 'dark:!text-primary-400 !text-primary' },
      }"
      class="w-full max-w-full"
      :columns="breakPointColumns"
      :rows="data"
      :sort-button="{
        color: 'primary',
      }"
      :sort="{ column: 'rank', direction: 'asc' }"
    >
      <template #name-data="{ row }">
        <NuxtLink :to="`/user/${row.name.name}`">
          <div class="flex flex-row items-center space-x-2 hover:opacity-80">
            <UAvatar
              :src="img(row.name.image, { width: 32, height: 32 })"
              :alt="row.name.name"
            />
            <span class="truncate font-semibold">{{ row.name.name }}</span>
          </div>
        </NuxtLink>
      </template>
      <template #rank-data="{ row }">
        <div class="flex items-center gap-1">
          <span class="text-2xl">
            <UIcon
              v-if="getEmoji(row.rank) !== ''"
              :name="getEmoji(row.rank)"
            />
          </span>
          <span :class="getClass(row.rank)">
            {{ useGetOrdinalSuffix(row.rank) }}
          </span>
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'

const img = useImage()
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

// create columns
const columns = ref([
  {
    key: 'rank',
    label: 'Rank',
    sortable: true,
    class: '!w-24',
  },
  {
    key: 'name',
    label: 'Name',
    class: 'sm:!w-48 !w-full',
  },
  {
    key: 'total_score',
    label: 'Score',
    sortable: true,
    class: '!w-24',
  },
])

const sectionsColumns = event.value?.sections.map((section) => {
  return {
    key: section.heading ?? '',
    label: section.heading ?? '',
    sortable: true,
    class: '!w-24',
  }
})

const mobileColumns = ref(columns.value)
if (sectionsColumns) {
  columns.value = columns.value
    .slice(0, 2)
    .concat(sectionsColumns, columns.value.slice(2))
}

const breakPointColumns = ref(columns.value)
const breakpoints = useBreakpoints(breakpointsTailwind)
const sm = breakpoints.smallerOrEqual(columns.value.length > 8 ? 'xl' : 'lg')

function updateColumns() {
  if (sm.value)
    breakPointColumns.value = mobileColumns.value
  else
    breakPointColumns.value = columns.value
}
updateColumns()
watch(sm, () => {
  updateColumns()
})

// create data

const data: Ref<any[]> = ref([])
event.value?.entries.forEach((entry) => {
  const sectionPoints: { name: string, score: number }[] = []
  entry.entrySections.forEach((section) => {
    sectionPoints.push({
      name:
        event.value?.sections.find(s => s.id === section.sectionId)?.heading
        ?? '',
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
  event.value?.sections.forEach((section) => {
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

function getEmoji(position: number) {
  if (everyQuestionHasResult())
    return getMedalIcon(position)
  else
    return ''
}

function getClass(position: number) {
  if (everyQuestionHasResult())
    return getRankClass(position)
}
</script>
