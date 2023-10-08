<template>
  <div class="space-y-2 py-2">
    <div class="flex w-full flex-row space-x-2">
      <USelectMenu
        v-model="selected"
        class="w-full"
        :options="people"
        size="xl"
        multiple
        placeholder="Select people">
        <template #label>
          <div class="flex flex-row flex-wrap gap-1">
            <div
              v-for="person in selected"
              :key="person?.id"
              class="flex flex-row items-center gap-1 rounded-lg bg-gray-200 p-1 px-2 dark:bg-gray-800">
              <UAvatar
                :src="person?.avatar.src ?? ''"
                :alt="person?.label ?? ''"
                size="3xs" />
              <span class="text-sm">{{ person?.label }}</span>
            </div>
          </div>
        </template>
      </USelectMenu>
      <UButton
        :label="
          selected.length === people?.length ? 'Unselect all' : 'Select all'
        "
        variant="outline"
        @click="selectAll" />
    </div>
    <div class="flex flex-col space-y-2">
      <div
        v-for="section in event?.sections"
        :key="section.id"
        class="flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div class="inline-block space-x-1">
          <span class="mb-2 text-xl text-black dark:text-white">
            {{ section.heading }}
          </span>
          <span class="text-xs">
            ({{ getSectionTotalPoints(section) }}
            {{ pluralize('point', getSectionTotalPoints(section)) }})
          </span>
        </div>
        <div
          v-for="question in section.questions"
          :key="question.id"
          class="flex flex-col">
          <div class="inline-block space-x-1">
            <span class="font-semibold">{{ question.question }}</span>
            <span class="text-xs">
              ({{ question.points }} {{ pluralize('point', question.points) }})
            </span>
          </div>
          <div class="flex flex-row flex-wrap items-center gap-2">
            <template v-for="person in selected" :key="person.id">
              <UBadge
                :color="getColor(section.id, question.id, person?.id ?? 0)"
                size="lg"
                variant="solid"
                class="space-x-2">
                <UTooltip
                  :text="person?.label ?? ''"
                  :prevent="selected.length === 1">
                  <div class="flex flex-row items-center gap-2">
                    <UAvatar
                      v-if="selected.length > 1"
                      :src="person?.avatar.src ?? ''"
                      :alt="person?.label ?? ''"
                      size="2xs"
                      class="flex-none text-gray-400" />
                    <span>
                      {{ getAnswer(section.id, question.id, person?.id ?? 0) }}
                    </span>
                  </div>
                </UTooltip>
              </UBadge>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pluralize from 'pluralize'
const { session } = useAuth()
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const people = ref(
  event.value?.entries
    .map(entry => entry.user)
    .map(user => {
      return {
        id: user.id,
        label: user.name,
        avatar: { src: user.image, alt: user.name },
      }
    })
)
const selected = ref([
  people.value?.find(person => person.id === session.value?.user.id) ??
    people.value?.[0],
])

watch(selected, (newSelected, oldSelected) => {
  if (newSelected.length === 0) {
    selected.value = oldSelected
  }
})

function pluralize(str: string, number: number) {
  return Pluralize(str, number)
}

function getSectionTotalPoints(section: Section) {
  let total = 0
  section.questions.forEach(question => {
    total += question.points
  })
  return total
}

function getAnswer(sectionId: number, questionId: number, personId: number) {
  const entryQuestion = event.value?.entries
    .find(entry => entry.userId === personId)
    ?.entrySections.find(entry => entry.sectionId === sectionId)
    ?.entryQuestions.find(entry => entry.questionId === questionId)

  if (entryQuestion) {
    const type = entryQuestion.question.type
    switch (type) {
      case 'TEXT':
        return entryQuestion.entryString
      case 'NUMBER':
        return entryQuestion.entryNumber
      case 'TIME':
        return entryQuestion.entryString
      case 'BOOLEAN':
        if (
          entryQuestion.entryBoolean === undefined ||
          entryQuestion.entryBoolean === null
        )
          return null
        if (entryQuestion.entryBoolean) return 'Yes'
        else return 'No'
      case 'MULTI':
        return entryQuestion.entryOption?.title
      default:
        return ''
    }
  }

  return ''
}

function getColor(sectionId: number, questionId: number, personId: number) {
  const entryQuestion = event.value?.entries
    .find(entry => entry.userId === personId)
    ?.entrySections.find(entry => entry.sectionId === sectionId)
    ?.entryQuestions.find(entry => entry.questionId === questionId)

  if (entryQuestion) {
    const type = entryQuestion.question.type
    if (type === 'MULTI' && !entryQuestion.question.optionId) return 'blue'
    else if (type === 'TEXT' && !entryQuestion.question.resultString)
      return 'blue'
    else if (type === 'NUMBER' && entryQuestion.question.resultNumber === null)
      return 'blue'
    else if (type === 'TIME' && !entryQuestion.question.resultString)
      return 'blue'
    else if (
      type === 'BOOLEAN' &&
      entryQuestion.question.resultBoolean === null
    )
      return 'blue'
    else if (entryQuestion.questionScore === 0) return 'red'
    else if (entryQuestion.questionScore > 0) return 'green'
    else return 'blue'
  }
  return 'blue'
}

function selectAll() {
  if (selected.value.length === people.value?.length) {
    selected.value = [
      people.value?.find(person => person.id === session.value?.user.id) ??
        people.value?.[0],
    ]
  } else {
    selected.value = people.value ?? []
  }
}
</script>
