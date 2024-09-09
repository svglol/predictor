<template>
  <div :key="question.id">
    <UFormGroup
      :name="question.question ?? ''"
      :label="question.question ?? ''"
    >
      <USelectMenu
        v-if="question.type === 'MULTI'"
        v-model="optionSetSelected"
        :options="optionSetsNames"
        :disabled="disabled"
        color="gray"
      />
      <UInput
        v-else-if="question.type === 'TIME'"
        v-model="questionResultString"
        v-maska
        color="gray"
        variant="outline"
        :disabled="disabled"
        type="text"
        data-maska="##:##:##"
        placeholder="hh:mm:ss"
      />
      <UInput
        v-else-if="question.type === 'NUMBER'"
        v-model="questionResultNumber"
        color="gray"
        variant="outline"
        :disabled="disabled"
        type="number"
      />
      <UInput
        v-else-if="question.type === 'TEXT'"
        v-model="questionResultString"
        color="gray"
        :disabled="disabled"
        variant="outline"
        type="text"
      />
      <URadio
        v-for="option of booleanOptions"
        v-else-if="question.type === 'BOOLEAN'"
        :key="option.name"
        v-model="questionResultBoolean"
        :disabled="disabled"
        v-bind="option"
      />
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
  { name: `no-${question.value.id}`, value: false, label: 'No',
  },
  {
    name: `empty-${question.value.id}`,
    value: undefined,
    label: 'Empty',
  },
]

const optionSetsNames = ref(
  question.value.optionSet?.options.map(({ id, title: label }) => ({
    id,
    label,
  })) ?? [],
)
optionSetsNames.value.unshift({ id: -1, label: 'None' })

const optionSetSelected = computed({
  get() {
    return optionSetsNames.value.filter(
      optionSet => optionSet.id === question.value.optionId,
    )[0] ?? optionSetsNames.value[0]
  },
  set(value) {
    if (!value || value.id === -1)
      question.value.optionId = null
    question.value.optionId = value.id
  },
})

const questionResultString = computed({
  get() {
    return question.value.resultString ?? undefined
  },
  set(value) {
    if (value)
      question.value.resultString = value
  },
})

const questionResultNumber = computed({
  get() {
    return question.value.resultNumber ?? undefined
  },
  set(value) {
    if (value)
      question.value.resultNumber = value
  },
})

const questionResultBoolean = computed({
  get() {
    return question.value.resultBoolean ?? undefined
  },
  set(value) {
    if (value)
      question.value.resultBoolean = value
  },
})
</script>
