<template>
  <div>
    <UFormGroup
      :name="questionRef.question ?? ''"
      :label="questionRef.question ?? ''">
      <template v-if="questionRef.type === 'MULTI'">
        <USelectMenu v-model="optionSetSelected" :options="optionSetsNames" />
      </template>
      <template v-else-if="questionRef.type === 'TIME'">
        <UInput
          v-model="resultString"
          v-maska
          color="primary"
          variant="outline"
          type="text"
          data-maska="##:##:##"
          placeholder="hh:mm:ss" />
      </template>
      <template v-else-if="questionRef.type === 'NUMBER'">
        <UInput
          v-model="resultNumber"
          color="primary"
          variant="outline"
          type="number" />
      </template>
      <template v-else-if="questionRef.type === 'TEXT'">
        <UInput
          v-model="resultString"
          color="primary"
          variant="outline"
          type="text" />
      </template>
      <template v-else-if="questionRef.type === 'BOOLEAN'">
        <URadio
          v-for="option of booleanOptions"
          :key="option.name"
          v-model="resultBoolean"
          v-bind="option" />
      </template>
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
const { question } = $defineProps<{
  question: questionWithResult
}>()

const booleanOptions = [
  {
    name: 'yes',
    value: true,
    label: 'Yes',
  },
  {
    name: 'no',
    value: false,
    label: 'No',
  },
  {
    name: 'empty',
    value: 'empty',
    label: 'Empty',
  },
]

const questionRef = $$(question)

const resultString = ref('')
const resultBoolean = ref()
const resultNumber: Ref<string | number> = ref('')

const optionSetsNames = ref(
  question.optionSet?.options.map(({ id, title: label }) => ({ id, label })) ??
    []
)
optionSetsNames.value.unshift({ id: -1, label: 'None' })

const optionSetSelected = ref()

switch (question.type) {
  case 'TEXT':
    resultString.value = question.resultString ?? ''
    break
  case 'NUMBER':
    resultNumber.value = question.resultNumber ?? ''
    break
  case 'BOOLEAN':
    resultBoolean.value = question.resultBoolean ?? 'empty'
    break
  case 'TIME':
    resultString.value = question.resultString ?? ''
    break
  case 'MULTI':
    optionSetSelected.value =
      optionSetsNames.value.filter(
        optionSet => optionSet.id === question.optionId
      )[0] ?? optionSetsNames.value[0]
}

const emit = defineEmits(['updateQuestion'])

watchDeep(
  () => resultBoolean,
  resultBoolean => {
    if (resultBoolean.value === 'empty') questionRef.value.resultBoolean = null
    else questionRef.value.resultBoolean = resultBoolean.value
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    questionRef.value.optionId = null
    emit('updateQuestion', questionRef.value)
  }
)

watchDeep(
  () => resultNumber,
  resultNumber => {
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    questionRef.value.optionId = null

    if (resultNumber.value !== '')
      questionRef.value.resultNumber = Number(resultNumber.value)
    emit('updateQuestion', questionRef.value)
  }
)

watchDeep(
  () => resultString,
  resultString => {
    questionRef.value.resultString = null
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.optionId = null

    if (resultString.value !== '')
      questionRef.value.resultString = resultString.value
    emit('updateQuestion', questionRef.value)
  }
)

watchDeep(
  () => optionSetSelected,
  optionSetSelected => {
    questionRef.value.optionId = optionSetSelected.value.id
    if (optionSetSelected.value.id === -1) {
      questionRef.value.optionId = null
    }
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    emit('updateQuestion', questionRef.value)
  }
)

const { $bus } = useNuxtApp()

$bus.$on('resetQuestion', () => {
  resultBoolean.value = 'empty'
  resultNumber.value = ''
  resultString.value = ''
  optionSetSelected.value = optionSetsNames.value[0]
  questionRef.value.resultString = null
  questionRef.value.resultBoolean = null
  questionRef.value.resultNumber = null
  questionRef.value.optionId = null
  emit('updateQuestion', questionRef.value)
})
</script>
