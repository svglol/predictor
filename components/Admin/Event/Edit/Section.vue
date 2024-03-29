<template>
  <div
    class="divide-y divide-gray-200 bg-white shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800"
  >
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex grow flex-row items-center space-x-2">
        <DragHandle v-if="!disabled">
          <UIcon name="material-symbols:drag-indicator" class="mr-4" />
        </DragHandle>
        <div class="flex flex-col gap-2">
          <UInput
            v-model="title"
            color="primary"
            variant="none"
            placeholder="Section Title"
            class="!text-xl text-black dark:text-white"
            :disabled="disabled"
            :ui="{ wrapper: 'w-full' }"
          />
          <div class="ml-2 flex flex-row items-center gap-2">
            <UBadge variant="subtle">
              Questions: {{ section.questions.length }}
            </UBadge>
            <UBadge variant="subtle">
              Points: {{ sectionPoints }}
            </UBadge>
          </div>
        </div>
      </div>
      <div class="flex flex-row space-x-2">
        <UTooltip text="Delete">
          <UButton
            icon="material-symbols:delete-outline"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="() => $emit('deleteSection', section.id)"
          />
        </UTooltip>
        <UTooltip :text="open ? 'Close' : 'Open'">
          <UButton
            icon="i-heroicons-chevron-down"
            color="gray"
            variant="ghost"
            :class="open ? 'rotate-180 transform' : ''"
            @click="open = !open"
          />
        </UTooltip>
      </div>
    </div>
    <div v-if="open" class="px-4 py-5">
      <div class="flex w-full flex-col items-stretch space-y-2">
        <div class="flex flex-col space-y-2">
          <UFormGroup name="description" label="Section Description">
            <UTextarea
              v-model="description"
              color="gray"
              placeholder="Section Description"
              :disabled="disabled"
            />
          </UFormGroup>
          <SlickList v-model:list="questions" axis="y" :use-drag-handle="true">
            <SlickItem
              v-for="(question, i) in questions"
              :key="question.id"
              :index="i"
            >
              <AdminEventEditQuestion
                :question="question"
                :section="section"
                :option-sets="optionSets"
                :disabled="disabled"
                @duplicate-question="duplicateQuestion"
                @delete-question="deleteQuestion"
              />
            </SlickItem>
          </SlickList>
        </div>
        <div class="mt-2 flex flex-row-reverse">
          <UButton
            icon="i-heroicons-plus"
            color="gray"
            :disabled="disabled"
            @click="addQuestion()"
          >
            Add question
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'deleteSection', id: number): void
}>()

const { section, optionSets, disabled } = defineModels<{
  section: EventSection & { questions: Question[] }
  optionSets: OptionSet[] | null
  disabled: boolean
}>()

const open = ref(true)
const title = ref(section.value.heading ?? '')
const description = ref(section.value.description ?? '')
const questions = ref(section.value.questions ?? [])

const sectionPoints = computed(() => {
  return questions.value
    .map((question) => {
      return question.points
    })
    .reduce((a, b) => a + b, 0)
})

watchDeep(
  () => section,
  () => {
    title.value = section.value.heading ?? ''
    description.value = section.value.description ?? ''
  },
)

watch([questions, title, description], () => {
  questions.value.forEach((question, i) => {
    question.order = i
  })
  section.value.heading = title.value
  section.value.description = description.value
})

async function addQuestion() {
  const question = await useClient().eventsAdmin.addQuestion.mutate({
    eventSectionId: section.value.id,
    order: questions.value.length,
  })
  if (question)
    questions.value.push(question)
}

async function deleteQuestion(questionId: number) {
  const mutate = await useClient().eventsAdmin.deleteQuestion.mutate(questionId)
  if (mutate) {
    questions.value = questions.value.filter(
      question => question.id !== questionId,
    )
  }
}

async function duplicateQuestion(questionId: number) {
  const questionToDuplicate = questions.value.find(
    question => question.id === questionId,
  )
  if (!questionToDuplicate)
    return
  let optionSetId: number | null = questionToDuplicate?.optionSetId ?? null
  if (questionToDuplicate.type !== 'MULTI')
    optionSetId = null

  const question = await useClient().eventsAdmin.addQuestion.mutate({
    eventSectionId: section.value.id,
    question: questionToDuplicate?.question ?? '',
    order: section.value.questions.length,
    type: questionToDuplicate?.type ?? 'TEXT',
    optionSetId,
    points: Number(questionToDuplicate.points),
  })
  if (question)
    questions.value.push(question)
}
</script>
