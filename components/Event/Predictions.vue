<template>
  <div class="space-y-6">
    <div class="flex w-full flex-row space-x-2">
      <USelectMenu
        v-model="selected"
        class="w-full"
        :options="people"
        size="xl"
        multiple
        placeholder="Select people">
        <template #label>
          <span class="flex xl:hidden">
            <div
              v-if="selected.length === 1"
              class="flex flex-row items-center gap-1 rounded-lg bg-gray-200 p-1 px-2 dark:bg-gray-800">
              <UAvatar
                class="contents"
                :src="selected[0]?.avatar.src + '?size=16' ?? ''"
                :alt="selected[0]?.label ?? ''"
                size="3xs" />
              <span class="contents text-sm">
                {{ selected[0]?.label }}
              </span>
            </div>
            <template v-else>{{ selected.length }} selected</template>
          </span>
          <div class="hidden flex-row flex-wrap items-center gap-2 xl:flex">
            <div
              v-for="person in selected"
              :key="person?.id"
              class="flex flex-row items-center gap-1 rounded-lg bg-gray-200 p-1 px-2 dark:bg-gray-800">
              <UAvatar
                class="contents"
                :src="person?.avatar.src + '?size=16' ?? ''"
                :alt="person?.label ?? ''"
                size="3xs" />
              <span class="contents text-sm">
                {{ person?.label }}
              </span>
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
    <div class="flex flex-col gap-6">
      <div
        v-for="section in event?.sections"
        :key="section.id"
        class="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-100 p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div class="flex flex-row items-baseline gap-2">
          <span class="text-xl text-black dark:text-white">
            {{ section.heading }}
          </span>
          <span class="text-xs text-gray-600 dark:text-gray-400">
            ({{ getSectionTotalPoints(section) }}
            {{ pluralize('point', getSectionTotalPoints(section)) }})
          </span>
        </div>
        <div
          v-for="question in section.questions"
          :key="question.id"
          class="flex flex-col">
          <div class="flex flex-row items-baseline gap-2">
            <span class="contents font-medium text-gray-700 dark:text-gray-200">
              {{ question.question }}
            </span>
            <span class="contents text-xs text-gray-600 dark:text-gray-400">
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

function getSectionTotalPoints(section: ImmutableObject<Section>) {
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
