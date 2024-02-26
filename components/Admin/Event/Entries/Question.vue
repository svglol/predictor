<template>
  <div class="flex flex-col gap-2">
    <UFormGroup :label="entryQuestion.question.question ?? ''" :error="error">
      <template v-if="entryQuestion.question.type === 'MULTI'">
        <USelect
          v-model="optionSetSelected"
          :disabled="disabled"
          variant="outline"
          :options="optionSetsNames"
          color="gray"
          :ui="{
            variant: {
              outline:
                'shadow-sm bg-transparent dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400',
            },
          }" />
      </template>
      <template v-else-if="entryQuestion.question.type === 'TIME'">
        <UInput
          v-model="answerString"
          v-maska
          :disabled="disabled"
          color="gray"
          variant="outline"
          type="text"
          data-maska="##:##:##"
          placeholder="hh:mm:ss" />
      </template>
      <template v-else-if="entryQuestion.question.type === 'NUMBER'">
        <UInput
          v-model="answerNumber"
          color="gray"
          :disabled="disabled"
          variant="outline"
          type="number" />
      </template>
      <template v-else-if="entryQuestion.question.type === 'TEXT'">
        <UInput
          v-model="answerString"
          color="gray"
          :disabled="disabled"
          variant="outline"
          type="text" />
      </template>
      <template v-else-if="entryQuestion.question.type === 'BOOLEAN'">
        <URadio
          v-for="option of booleanOptions"
          :key="option.name"
          v-model="answerBoolean"
          :disabled="disabled"
          v-bind="option" />
      </template>
      <template #label>
        {{ entryQuestion.question.question ?? '' }}
        <UIcon v-if="isCorrect" name="uil:check" color="green" />
        <UIcon
          v-if="!isCorrect && isCorrect !== null"
          name="radix-icons:cross-1"
          color="red" />
      </template>
    </UFormGroup>
  </div>
</template>

<script lang="ts" setup>
import { type WritableComputedRef } from 'vue'
const { entryQuestion } = defineModels<{
  entryQuestion: EventEntryQuestionWithOptions
}>()

defineProps<{
  disabled: boolean
}>()

const booleanOptions = [
  {
    name: `yes-${entryQuestion.value.id}`,
    value: true,
    label: 'Yes',
  },
  {
    name: `no-${entryQuestion.value.id}`,
    value: false,
    label: 'No',
  },
]

const optionSetsNames = ref(
  entryQuestion.value.question.optionSet?.options
    .map(({ id, title: label, order }) => ({
      value: id,
      label,
      order,
    }))
    .sort((a, b) => a.order - b.order) ?? []
)
const optionSetSelected = computed({
  get() {
    return (
      optionSetsNames.value.find(
        ({ value }) => value === entryQuestion.value.entryOptionId
      )?.value ?? null
    )
  },
  set(value) {
    if (!value) entryQuestion.value.entryOptionId = null
    entryQuestion.value.entryOptionId = Number(value)
  },
}) as WritableComputedRef<string | number | undefined>

const answerString = computed({
  get() {
    return entryQuestion.value.entryString
  },
  set(value) {
    if (!value) entryQuestion.value.entryString = null
    entryQuestion.value.entryString = String(value)
  },
}) as WritableComputedRef<string>

const answerNumber = computed({
  get() {
    return entryQuestion.value.entryNumber
  },
  set(value) {
    if (!value) entryQuestion.value.entryNumber = null
    entryQuestion.value.entryNumber = Number(value)
  },
}) as WritableComputedRef<number>

const answerBoolean = computed({
  get() {
    return entryQuestion.value.entryBoolean
  },
  set(value) {
    if (!value) entryQuestion.value.entryBoolean = null
    entryQuestion.value.entryBoolean = Boolean(value)
  },
}) as WritableComputedRef<boolean>

const isCorrect = computed(() => {
  const type = entryQuestion.value.question.type
  if (type === 'MULTI' && !entryQuestion.value.question.optionId) return null
  else if (type === 'TEXT' && !entryQuestion.value.question.resultString)
    return null
  else if (type === 'NUMBER' && !entryQuestion.value.question.resultNumber)
    return null
  else if (type === 'TIME' && !entryQuestion.value.question.resultString)
    return null
  else if (
    type === 'BOOLEAN' &&
    entryQuestion.value.question.resultBoolean === null
  )
    return null
  else if (entryQuestion.value.questionScore === 0) return false
  else if (entryQuestion.value.questionScore > 0) return true
  else return null
})

const error = computed(() => {
  if (
    entryQuestion.value.question.type === 'MULTI' &&
    !entryQuestion.value.entryOptionId
  )
    return 'Please select an option'
  else if (
    entryQuestion.value.question.type === 'TEXT' &&
    !entryQuestion.value.entryString
  ) {
    return 'Please enter a value'
  } else if (
    entryQuestion.value.question.type === 'NUMBER' &&
    entryQuestion.value.entryNumber === null
  )
    return 'Please enter a value'
  else if (
    entryQuestion.value.question.type === 'TIME' &&
    !entryQuestion.value.entryString
  )
    return 'Please enter a value'
  else if (
    entryQuestion.value.question.type === 'BOOLEAN' &&
    entryQuestion.value.entryBoolean === null
  )
    return 'Please select an option'
  else return false
})
</script>
