<template>
  <div
    class="ring-primary my-4 divide-y divide-gray-200 rounded-lg bg-white shadow ring-1 dark:divide-gray-800 dark:bg-gray-900">
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex grow flex-row items-center space-x-2">
        <DragHandle v-if="!disabled">
          <Icon name="heroicons:bars-3" class="mr-4" />
        </DragHandle>
        <UInput
          v-model="questionText"
          color="primary"
          variant="none"
          placeholder="Question Title"
          required
          class="text-black dark:text-white"
          :disabled="disabled"
          :ui="{ wrapper: 'w-full' }" />
      </div>
      <div class="flex flex-row space-x-2">
        <UTooltip text="Duplicate">
          <UButton
            icon="i-heroicons-document-duplicate"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="duplicate" />
        </UTooltip>
        <UTooltip text="Delete">
          <UButton
            icon="material-symbols:delete-outline"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="() => $emit('deleteQuestion', question.id)" />
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
        <UFormGroup name="question_type" label="Question Type" required>
          <USelectMenu
            v-model="questionTypeSelected"
            :options="questionType"
            color="primary"
            :disabled="disabled" />
        </UFormGroup>
        <UFormGroup name="question_hint" label="Question Hint">
          <UInput
            v-model="questionHint"
            color="primary"
            placeholder="Hint"
            :disabled="disabled" />
        </UFormGroup>
        <UFormGroup
          v-if="questionTypeSelected === 'MULTI'"
          name="option_set"
          label="Option Set"
          required>
          <USelectMenu
            v-model="optionSetSelected"
            color="primary"
            :options="optionSetsNames"
            :disabled="disabled" />
        </UFormGroup>

        <UFormGroup name="Points" label="Points" required>
          <UInput v-model="questionPoints" color="primary" type="number" />
        </UFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventSection, OptionSet, Question } from '@prisma/client'

const emit = defineEmits([
  'deleteQuestion',
  'updateQuestion',
  'duplicateQuestion',
])

const { question, optionSets, disabled } = $defineProps<{
  question: Question
  section: EventSection
  optionSets: OptionSet[] | null
  disabled: boolean
}>()

const open = ref(false)

const questionType = ref(['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN'])

const optionSetsNames = ref(
  optionSets?.map(({ id, title: label }) => ({ id, label }))
)

if (optionSetsNames.value?.length === 0) {
  questionType.value.shift()
}

const questionText = ref(question.question ?? '')
const questionHint = ref(question.hint ?? '')
const questionTypeSelected = ref(question.type ?? questionType.value[0])
const questionPoints = ref(question.points ?? 1)

const optionSetSelected = ref(
  optionSetsNames.value?.filter(
    optionSet => optionSet.id === question.optionSetId
  )[0] ?? optionSetsNames.value?.[0]
)

watch(
  [
    questionText,
    questionTypeSelected,
    optionSetSelected,
    questionPoints,
    questionHint,
  ],
  () => {
    let optionSetId: number | null = optionSetSelected.value?.id ?? -1
    if (questionTypeSelected.value !== 'MULTI') {
      optionSetId = null
    }
    emit('updateQuestion', {
      id: question.id,
      question: questionText.value,
      hint: questionHint.value,
      type: questionTypeSelected.value,
      optionSetId: optionSetId,
      order: question.order,
      points: Number(questionPoints.value),
    })
  }
)

function duplicate() {
  let optionSetId: number | null = optionSetSelected.value?.id ?? -1
  if (questionTypeSelected.value !== 'MULTI') {
    optionSetId = null
  }
  emit('duplicateQuestion', {
    question: questionText.value,
    hint: questionHint.value,
    type: questionTypeSelected.value,
    optionSetId: optionSetId,
    points: Number(questionPoints.value),
  })
}
</script>
