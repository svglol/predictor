<template>
  <div
    class="my-4 divide-y divide-gray-200 rounded-lg bg-white shadow ring-1 ring-gray-300 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-700">
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex grow flex-row items-center space-x-2">
        <DragHandle v-if="!disabled">
          <UIcon name="heroicons:bars-3" class="mr-4" />
        </DragHandle>
        <UInput
          v-model="title"
          color="primary"
          variant="none"
          placeholder="Section Title"
          class="!text-xl text-black dark:text-white"
          :disabled="disabled"
          :ui="{ wrapper: 'w-full' }" />
      </div>
      <div class="flex flex-row space-x-2">
        <UTooltip text="Delete">
          <UButton
            icon="material-symbols:delete-outline"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="() => $emit('deleteSection', section.id)" />
        </UTooltip>
        <UTooltip :text="open ? 'Close' : 'Open'">
          <UButton
            icon="i-heroicons-chevron-down"
            color="gray"
            variant="ghost"
            :class="open ? 'rotate-180 transform' : ''"
            @click="open = !open" />
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
              :disabled="disabled" />
          </UFormGroup>
          <SlickList v-model:list="questions" axis="y" :use-drag-handle="true">
            <SlickItem
              v-for="(question, i) in questions"
              :key="question.id"
              :index="i"
              class="my-2">
              <AdminEventEditQuestion
                :question="question"
                :section="section"
                :option-sets="optionSets"
                :disabled="disabled"
                @delete-question="deleteQuestion" />
            </SlickItem>
          </SlickList>
        </div>
        <div class="mt-2 flex flex-row-reverse">
          <UButton
            icon="i-heroicons-plus"
            color="gray"
            :disabled="disabled"
            @click="addQuestion()">
            Add question
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()

defineEmits<{
  (e: 'deleteSection', id: number): void
}>()
const { section } = defineModels<{
  section: EventSection & { questions: Question[] }
  optionSets: OptionSet[] | null
  disabled: boolean
}>()

const open = ref(true)
const title = ref(section.value.heading ?? '')
const description = ref(section.value.description ?? '')
const questions = ref(section.value.questions ?? [])

watchDeep(
  () => section,
  () => {
    title.value = section.value.heading ?? ''
    description.value = section.value.description ?? ''
  }
)

watch([questions, title, description], () => {
  questions.value.forEach((question, i) => {
    question.order = i
  })
  section.value.heading = title.value
  section.value.description = description.value
})

async function addQuestion() {
  const question = await $client.eventsAdmin.addQuestion.mutate({
    eventSectionId: section.value.id,
    order: questions.value.length,
  })
  if (question) {
    questions.value.push(question)
  }
}

async function deleteQuestion(questionId: number) {
  const mutate = await $client.eventsAdmin.deleteQuestion.mutate(questionId)
  if (mutate) {
    questions.value = questions.value.filter(
      question => question.id !== questionId
    )
  }
}
</script>
