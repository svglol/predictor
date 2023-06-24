<template>
  <div>
    <UTable
      :columns="columns"
      :rows="data"
      :sort="{ column: 'rank', direction: 'desc' }"
    >
      <template #name-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.name.image" />
          <span>{{ row.name.name }}</span>
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

//create columns
const columns = ref([
  {
    key: "name",
    label: "Name",
  },
  {
    key: "total_score",
    label: "Total Score",
    sortable: true,
  },
  {
    key: "rank",
    label: "Rank",
    sortable: true,
  },
])

const sectionsColumns = event.value.sections.map((section) => {
  return {
    key: section.heading ?? "",
    label: section.heading ?? "",
    sortable: true,
  }
})

columns.value = columns.value
  .slice(0, 1)
  .concat(sectionsColumns, columns.value.slice(1))

//create data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: Ref<any[]> = ref([])
event.value.entries.forEach((entry) => {
  let sectionPoints: { name: string; score: number }[] = []
  entry.entrySections.forEach((section) => {
    sectionPoints.push({
      name:
        event.value.sections.find((s) => s.id === section.sectionId)?.heading ??
        "",
      score: section.sectionScore,
    })
  })

  const sectionPointsObj = sectionPoints.reduce((accumulator, value) => {
    return { ...accumulator, [value.name]: value.score }
  }, {})
  const total = sectionPoints.reduce((a, b) => a + b.score, 0)
  data.value.push({
    name: { name: entry.user.name, image: entry.user.image },
    ...sectionPointsObj,
    total_score: total,
    rank: entry.rank,
  })
})
</script>

<style scoped></style>
