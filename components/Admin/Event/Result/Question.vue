<template>
  <div :key="question.id">
    <UFormGroup
      :name="question.question ?? ''"
      :label="question.question ?? ''"
    >
      <template v-if="question.type === 'MULTI'">
        <USelectMenu
          v-model="optionSetSelected"
          :options="optionSetsNames"
          :disabled="disabled"
          color="gray"
        />
      </template>
      <template v-else-if="question.type === 'TIME'">
        <UInput
          v-model="resultString"
          v-maska
          color="gray"
          variant="outline"
          :disabled="disabled"
          type="text"
          data-maska="##:##:##"
          placeholder="hh:mm:ss"
        />
      </template>
      <template v-else-if="question.type === 'NUMBER'">
        <UInput
          v-model="resultNumber"
          color="gray"
          variant="outline"
          :disabled="disabled"
          type="number"
        />
      </template>
      <template v-else-if="question.type === 'TEXT'">
        <UInput
          v-model="resultString"
          color="gray"
          :disabled="disabled"
          variant="outline"
          type="text"
        />
      </template>
      <template v-else-if="question.type === 'BOOLEAN'">
        <URadio
          v-for="option of booleanOptions"
          :key="option.name"
          v-model="resultBoolean"
          :disabled="disabled"
          v-bind="option"
        />
      </template>
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
const { question, disabled } = defineModels<{
  question: questionWithResult
  disabled: boolean
}>()

const booleanOptions = [
  {
    name: `yes-${question.value.id}`,
    value: true,
    label: 'Yes',
  },
  { name: `no-${question.value.id}`, value: false, label: 'No' },
  {
    name: `empty-${question.value.id}`,
    value: 'empty',
    label: 'Empty',
  },
]

const resultString = ref('')
const resultBoolean = ref()
const resultNumber: Ref<string | number> = ref('')

const optionSetSelected = ref()
const optionSetsNames = ref(
  question.value.optionSet?.options.map(({ id, title: label }) => ({
    id,
    label,
  })) ?? [],
)

watchDeep(question, () => {
  if (question.value.optionId === null && question.value.type === 'MULTI')
    optionSetSelected.value = optionSetsNames.value[0]

  if (
    question.value.resultNumber === null
    && question.value.type === 'NUMBER'
  )
    resultNumber.value = ''

  if (
    question.value.resultString === null
    && (question.value.type === 'TEXT' || question.value.type === 'TIME')
  )
    resultString.value = ''

  if (
    question.value.resultBoolean === null
    && question.value.type === 'BOOLEAN'
  )
    resultBoolean.value = 'empty'
})

optionSetsNames.value.unshift({ id: -1, label: 'None' })

switch (question.value.type) {
  case 'TEXT':
    resultString.value = question.value.resultString ?? ''
    break
  case 'NUMBER':
    resultNumber.value = question.value.resultNumber ?? ''
    break
  case 'BOOLEAN':
    resultBoolean.value = question.value.resultBoolean ?? 'empty'
    break
  case 'TIME':
    resultString.value = question.value.resultString ?? ''
    break
  case 'MULTI':
    optionSetSelected.value
      = optionSetsNames.value.filter(
        optionSet => optionSet.id === question.value.optionId,
      )[0] ?? optionSetsNames.value[0]
}

watchDeep(
  () => resultBoolean,
  (resultBoolean) => {
    if (resultBoolean.value === 'empty')
      question.value.resultBoolean = null
    else question.value.resultBoolean = resultBoolean.value
    question.value.resultNumber = null
    question.value.resultString = null
    question.value.optionId = null
  },
)

watchDeep(
  () => resultNumber,
  (resultNumber) => {
    question.value.resultBoolean = null
    question.value.resultNumber = null
    question.value.resultString = null
    question.value.optionId = null

    if (resultNumber.value !== '')
      question.value.resultNumber = Number(resultNumber.value)
  },
)

watchDeep(
  () => resultString,
  (resultString) => {
    question.value.resultString = null
    question.value.resultBoolean = null
    question.value.resultNumber = null
    question.value.optionId = null

    if (resultString.value !== '')
      question.value.resultString = resultString.value
  },
)

watchDeep(
  () => optionSetSelected,
  (optionSetSelected) => {
    question.value.optionId = optionSetSelected.value.id
    if (optionSetSelected.value.id === -1)
      question.value.optionId = null

    question.value.resultBoolean = null
    question.value.resultNumber = null
    question.value.resultString = null
  },
)
</script>
