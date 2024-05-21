<template>
  <div
    class="divide-y divide-gray-200 bg-white shadow ring-1 ring-gray-300 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-700"
  >
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex grow flex-row items-center space-x-2">
        <DragHandle v-if="!disabled">
          <UIcon name="material-symbols:drag-indicator" class="mr-4" />
        </DragHandle>
        <UInput
          v-model="question.question"
          color="primary"
          variant="none"
          placeholder="Question Title"
          required
          class="text-black dark:text-white"
          :disabled="disabled"
          :ui="{ wrapper: 'w-full' }"
        />
      </div>
      <div class="flex flex-row space-x-2">
        <UTooltip text="Duplicate">
          <UButton
            icon="i-heroicons-document-duplicate"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="$emit('duplicateQuestion', question)"
          />
        </UTooltip>
        <UTooltip text="Delete">
          <UButton
            icon="material-symbols:delete-outline"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="() => $emit('deleteQuestion', question.id)"
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
        <UFormGroup name="question_type" label="Question Type" required>
          <USelectMenu
            v-model="question.type"
            :options="questionType"
            color="gray"
            :disabled="disabled"
          />
        </UFormGroup>
        <UFormGroup name="question_hint" label="Question Hint">
          <UInput
            v-model="question.hint"
            color="gray"
            placeholder="Hint"
            :disabled="disabled"
          />
        </UFormGroup>
        <UFormGroup
          v-if="questionTypeSelected === 'MULTI'"
          name="option_set"
          label="Option Set"
          required
        >
          <USelectMenu
            v-model="optionSetSelected"
            color="gray"
            :options="optionSetsNames"
            :disabled="disabled"
          />
        </UFormGroup>

        <UFormGroup name="Points" label="Points" required>
          <UInput
            v-model="question.points"
            color="gray"
            type="number"
            :disabled="disabled"
          />
        </UFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'deleteQuestion', id: number): void
  (e: 'duplicateQuestion', question: Question): void
}>()
const { question, optionSets, disabled } = defineModels<{
  question: Question
  section: EventSection & { questions: Question[] }
  optionSets: OptionSet[] | null
  disabled: boolean
}>()
const open = ref(false)

const questionType = ref(['MULTI', 'TIME', 'NUMBER', 'TEXT', 'BOOLEAN'])

const optionSetsNames = ref(
  optionSets.value?.map(({ id, title: label }) => ({ id, label })),
)

if (optionSetsNames.value?.length === 0)
  questionType.value.shift()

const questionTypeSelected = ref(
  question.value.type ?? questionType.value[0],
) as Ref<'MULTI' | 'TIME' | 'NUMBER' | 'TEXT' | 'BOOLEAN'>

const optionSetSelected = ref(
  optionSetsNames.value?.filter(
    optionSet => optionSet.id === question.value.optionSetId,
  )[0] ?? optionSetsNames.value?.[0],
)

watch(
  [
    optionSetSelected,
  ],
  () => {
    let optionSetId: number | null = optionSetSelected.value?.id ?? -1
    if (questionTypeSelected.value !== 'MULTI')
      optionSetId = null

    question.value.optionSetId = optionSetId
  },
)
</script>
