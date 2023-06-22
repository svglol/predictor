<template>
  <div>
    <UTable
      :columns="columns"
      :rows="data"
      :sort="{ column: 'total_score', direction: 'desc' }"
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
  let sectionPoints: { name: string; points: number }[] = []
  entry.entrySections.forEach((section) => {
    let points = 0
    section.entryQuestions.forEach((entryQuestion) => {
      const type = entryQuestion.question.type
      let correct = false
      if (type === "MULTI") {
        if (entryQuestion.entryOptionId === entryQuestion.question.optionId)
          correct = true
      }
      if (type === "TIME") {
        if (entryQuestion.entryString === entryQuestion.question.resultString)
          correct = true
      }
      if (type === "NUMBER") {
        if (entryQuestion.entryNumber === entryQuestion.question.resultNumber)
          correct = true
      }
      if (type === "TEXT") {
        if (entryQuestion.entryString === entryQuestion.question.resultString)
          correct = true
      }
      if (type === "BOOLEAN") {
        if (entryQuestion.entryBoolean === entryQuestion.question.resultBoolean)
          correct = true
      }
      if (correct) points += entryQuestion.question.points
    })
    sectionPoints.push({
      name:
        event.value.sections.find((s) => s.id === section.sectionId)?.heading ??
        "",
      points: points,
    })
  })

  const sectionPointsObj = sectionPoints.reduce((accumulator, value) => {
    return { ...accumulator, [value.name]: value.points }
  }, {})
  const total = sectionPoints.reduce((a, b) => a + b.points, 0)
  data.value.push({
    name: { name: entry.user.name, image: entry.user.image },
    ...sectionPointsObj,
    total_score: total,
  })
})
</script>

<style scoped></style>
