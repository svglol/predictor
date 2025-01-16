<template>
  <div class="space-y-6">
    <div class="flex w-full flex-row space-x-2">
      <USelectMenu
        v-model="selected"
        class="w-full"
        :options="people"
        size="xl"
        multiple
        searchable
        placeholder="Select people"
      >
        <template #label>
          <span class="flex xl:hidden">
            <div
              v-if="selected.length === 1"
              class="flex flex-row items-center gap-1 rounded-lg bg-gray-200 p-1 px-2 dark:bg-gray-800"
            >
              <UAvatar
                class="contents"
                :src="
                  img(selected[0]?.avatar.src ?? '', { height: 16, width: 16 })
                "
                :alt="selected[0]?.label ?? ''"
                size="3xs"
              />
              <span class="contents text-sm">
                {{ selected[0]?.label }}
              </span>
            </div>
            <template v-else>
              <span class="p-1">{{ selected.length }} selected</span>
            </template>
          </span>

          <span v-if="selected.length === 0" class="hidden p-1 xl:flex">
            Select people
          </span>
          <div class="hidden flex-row flex-wrap items-center gap-2 xl:flex">
            <div
              v-for="person in selected"
              :key="person?.id"
              class="flex flex-row items-center gap-1 rounded-lg bg-gray-200 p-1 px-2 dark:bg-gray-800"
            >
              <UAvatar
                class="contents"
                :src="img(person?.avatar.src ?? '', { height: 16, width: 16 })"
                :alt="person?.label ?? ''"
                size="3xs"
              />
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
        @click="selectAll"
      />
    </div>
    <div class="flex flex-col gap-6">
      <div
        v-for="section in event?.sections"
        :key="section.id"
        class="flex flex-col gap-2"
      >
        <UDivider class="-mt-2" />
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
          class="flex flex-col"
        >
          <div class="flex flex-row items-baseline gap-2">
            <span class="contents font-medium text-gray-700 dark:text-gray-200">
              {{ question.question }}
            </span>
            <span class="contents text-xs text-gray-600 dark:text-gray-400">
              ({{ question.points }} {{ pluralize('point', question.points) }})
            </span>
          </div>
          <div
            class="mb-1 flex flex-col items-start gap-2 md:flex-row md:items-center"
          >
            <span v-if="hasResult(question)">
              {{ useGetResult(question) }}
            </span>
            <span v-else>TBD</span>
          </div>
          <div v-if="selected.length === 0" class="flex">
            <UBadge
              v-if="getUsersCorrect(question).length > 0"
              color="green"
              size="lg"
              variant="subtle"
              class="flex flex-wrap items-center gap-2"
            >
              <UIcon name="uil:check" size="1em" />
              <UTooltip
                v-for="user in getUsersCorrect(question)"
                :key="user.id"
                :text="user.name ?? ''"
              >
                <UAvatar
                  class="text-gray-400"
                  size="2xs"
                  :src="img(user.image ?? '', { height: 20, width: 20 })"
                  :alt="user.name ?? ''"
                />
              </UTooltip>
            </UBadge>
          </div>
          <div class="flex flex-row flex-wrap items-center gap-2">
            <template v-for="person in selected" :key="person.id">
              <UBadge
                :color="getColor(section.id, question.id, person?.id ?? '0')"
                size="lg"
                variant="subtle"
                class="space-x-2"
              >
                <UTooltip
                  :text="person?.label ?? ''"
                  :prevent="selected.length === 1"
                >
                  <span class="inline-flex items-baseline gap-2">
                    <UAvatar
                      :src="
                        img(person?.avatar.src ?? '', { height: 20, width: 20 })
                      "
                      :alt="person?.label ?? ''"
                      size="2xs"
                      class="self-center text-gray-400"
                    />
                    <span>
                      {{ getAnswer(section.id, question.id, person?.id ?? '') }}
                    </span>
                  </span>
                </UTooltip>
              </UBadge>
            </template>
          </div>
        </div>
      </div>
    </div>
    <UBadge color="red" class="hidden" />
    <UBadge color="green" class="hidden" />
    <UBadge color="blue" class="hidden" />
  </div>
</template>

<script setup lang="ts">
import Pluralize from 'pluralize'

const { event: eventProp } = defineProps<{
  event: PredictorEvent | null
}>()
const img = useImage()
const { session } = useAuth()
const event = $$(eventProp)

const people = useState(`people-${event.value?.id}`, () =>
  event.value?.entries
    .map(entry => entry.user)
    .map((user) => {
      return {
        id: user.id,
        label: user.name,
        avatar: { src: user.image, alt: user.name },
      }
    }))

const selected: Ref<
  {
    id: string
    label: string | null
    avatar: { src: string | null, alt: string | null }
  }[]
> = useState(`selected-${event.value?.id}`, () => [])

const firstTime = useState(`first-time-${event.value?.id}`, () => true)

if (session.value && session.value.user && firstTime.value) {
  const user = people.value?.find(
    person => person.id === session.value?.user.id,
  )
  if (user)
    selected.value.push(user)
  firstTime.value = false
}

function pluralize(str: string, number: number) {
  return Pluralize(str, number)
}

function getSectionTotalPoints(section: ImmutableObject<Section>) {
  let total = 0
  section.questions.forEach((question) => {
    total += question.points
  })
  return total
}

function getAnswer(sectionId: number, questionId: number, personId: string) {
  const entryQuestion = event.value?.entries
    .find(entry => entry.userId === personId)
    ?.entrySections
    .find(entry => entry.sectionId === sectionId)
    ?.entryQuestions
    .find(entry => entry.questionId === questionId)

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
          entryQuestion.entryBoolean === undefined
          || entryQuestion.entryBoolean === null
        ) {
          return null
        }
        if (entryQuestion.entryBoolean)
          return 'Yes'
        else return 'No'
      case 'MULTI':
        return entryQuestion.entryOption?.title
      default:
        return ''
    }
  }

  return ''
}

function getColor(sectionId: number, questionId: number, personId: string) {
  const entryQuestion = event.value?.entries
    .find(entry => entry.userId === personId)
    ?.entrySections
    .find(entry => entry.sectionId === sectionId)
    ?.entryQuestions
    .find(entry => entry.questionId === questionId)

  if (entryQuestion) {
    const type = entryQuestion.question.type
    if (type === 'MULTI' && !entryQuestion.question.optionId) {
      return 'blue'
    }
    else if (type === 'TEXT' && !entryQuestion.question.resultString) {
      return 'blue'
    }
    else if (type === 'NUMBER' && entryQuestion.question.resultNumber === null) {
      return 'blue'
    }
    else if (type === 'TIME' && !entryQuestion.question.resultString) {
      return 'blue'
    }
    else if (
      type === 'BOOLEAN'
      && entryQuestion.question.resultBoolean === null
    ) {
      return 'blue'
    }
    else if (entryQuestion.questionScore === 0) {
      return 'red'
    }
    else if (entryQuestion.questionScore > 0) {
      return 'green'
    }
    else {
      return 'blue'
    }
  }
  return 'blue'
}

function selectAll() {
  if (selected.value.length === people.value?.length) {
    if (session.value?.user) {
      selected.value = [
        people.value?.find(person => person.id === session.value?.user.id)
        ?? people.value?.[0],
      ]
    }
    else {
      selected.value = []
    }
  }
  else {
    selected.value = people.value ?? []
  }
}

function getUsersCorrect(
  resultQuestion: ImmutableObject<QuestionWithResultOption>,
) {
  const users: {
    readonly id: string
    readonly name: string | null
    readonly image: string | null
  }[] = []
  event.value?.entries.forEach((entry) => {
    entry.entrySections.forEach((section) => {
      section.entryQuestions
        .filter((question) => {
          return question.question.id === resultQuestion.id
        })
        .forEach((question) => {
          if (question.questionScore > 0)
            users.push(entry.user)
        })
    })
  })
  return users
}
</script>
