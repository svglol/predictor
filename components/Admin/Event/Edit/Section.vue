<template>
  <div
    class="divide-y divide-gray-200 bg-white shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800"
  >
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex grow flex-row items-center space-x-2">
        <DragHandle v-if="!disabled">
          <UIcon name="material-symbols:drag-indicator" class="mr-4" />
        </DragHandle>
        <div class="flex w-full flex-col gap-2">
          <UInput
            v-model="title as any"
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
              v-model="description as any"
              color="gray"
              placeholder="Section Description"
              :disabled="disabled"
            />
          </UFormGroup>
          <SlickList v-model:list="section.questions" axis="y" :use-drag-handle="true">
            <SlickItem
              v-for="(question, i) in section.questions"
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

const sectionPoints = computed(() => {
  return section.value.questions
    .map((question) => {
      return question.points
    })
    .reduce((a, b) => a + b, 0)
})

const title = computed({
  get() {
    return section.value.heading
  },
  set(value) {
    section.value.heading = value
  },
})

const description = computed({
  get() {
    return section.value.description
  },
  set(value) {
    section.value.description = value
  },
})

watchEffect(() => {
  section.value.questions.forEach((question, i) => {
    question.order = i
  })
})

async function addQuestion() {
  const question = await useClient().eventsAdmin.addQuestion.mutate({
    eventSectionId: section.value.id,
    order: section.value.questions.length,
  })
  if (question)
    section.value.questions.push(question)
}

async function deleteQuestion(questionId: number) {
  const mutate = await useClient().eventsAdmin.deleteQuestion.mutate(questionId)
  if (mutate) {
    section.value.questions = section.value.questions.filter(
      question => question.id !== questionId,
    )
  }
}

async function duplicateQuestion(questionToDuplicate: Question) {
  let optionSetId: number | null = questionToDuplicate?.optionSetId ?? null
  if (questionToDuplicate.type !== 'MULTI')
    optionSetId = null

  const question = await useClient().eventsAdmin.addQuestion.mutate({
    eventSectionId: section.value.id,
    question: questionToDuplicate?.question ?? '',
    order: section.value.questions.length,
    type: questionToDuplicate?.type ?? 'TEXT',
    optionSetId,
    points: questionToDuplicate.points,
  })
  if (question)
    section.value.questions.push(question)
}
</script>
