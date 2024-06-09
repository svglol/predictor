<template>
  <UFormGroup
    :name="question.question ?? ''"
    :label="question.question ?? ''"
    :error="formQuestion.valid"
    :ui="{
      label: { wrapper: '!justify-normal gap-2' },
    }"
    required
  >
    <template #label>
      {{ question.question }}
      <span class="contents text-xs text-gray-600 dark:text-gray-400">
        ({{ question.points }} {{ Pluralize('point', question.points) }})
      </span>
    </template>
    <template #description>
      <div
        v-if="question.hint && question.hint !== ''"
        class="contents items-center gap-1"
      >
        <UIcon name="material-symbols:info" />
        {{ question.hint }}
      </div>
    </template>
    <template v-if="question.type === 'MULTI'">
      <USelect
        v-model="optionSetSelected"
        variant="outline"
        :options="optionSetsNames"
        color="gray"
        :ui="{
          variant: {
            outline:
              'shadow-sm bg-transparent dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400',
          },
        }"
      />
    </template>
    <template v-else-if="question.type === 'TIME'">
      <UInput
        v-model="answerString"
        v-maska
        color="gray"
        variant="outline"
        type="text"
        data-maska="##:##:##"
        placeholder="hh:mm:ss"
      />
    </template>
    <template v-else-if="question.type === 'NUMBER'">
      <UInput
        v-model="answerNumber"
        color="gray"
        variant="outline"
        type="number"
      />
    </template>
    <template v-else-if="question.type === 'TEXT'">
      <UInput
        v-model="answerString"
        color="gray"
        variant="outline"
        type="text"
      />
    </template>
    <template v-else-if="question.type === 'BOOLEAN'">
      <URadio
        v-for="option of booleanOptions"
        :key="option.name"
        v-model="answerBoolean"
        v-bind="option"
      />
    </template>
  </UFormGroup>
</template>

<script setup lang="ts">
import Pluralize from 'pluralize'

const { question, formQuestion } = defineModels<{
  question: questionWithResult
  formQuestion: FormQuestion
}>()

const booleanOptions = [
  {
    name: `yes-${question.value.id}`,
    value: true,
    label: 'Yes',
  },
  {
    name: `no-${question.value.id}`,
    value: false,
    label: 'No',
  },
]
const answerString = computed({
  get: () => formQuestion.value.answerString ?? '',
  set: (value) => {
    formQuestion.value.answerString = value
  },
})

const answerNumber = computed({
  get: () => formQuestion.value.answerNumber ?? '',
  set: (value) => {
    formQuestion.value.answerNumber = Number(value)
  },
})

const answerBoolean = computed({
  get: () => formQuestion.value.answerBoolean,
  set: (value) => {
    formQuestion.value.answerBoolean = Boolean(value)
  },
})

const optionSetsNames = ref(
  question.value.optionSet?.options
    .map(({ id, title: label, order }) => ({
      value: id,
      label,
      order,
    }))
    .sort((a, b) => a.order - b.order) ?? [],
)

const optionSetSelected = computed({
  get: () => formQuestion.value.answerOption,
  set: (value) => {
    formQuestion.value.answerOption = Number(value)
  },
})

if (!optionSetSelected.value && question.value.type === 'MULTI')
  optionSetSelected.value = optionSetsNames.value[0].value

if ((answerBoolean.value === undefined || answerBoolean.value === null) && question.value.type === 'BOOLEAN')
  answerBoolean.value = false
</script>
