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
        v-model="question.resultString as any"
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
        v-model="question.resultNumber as any"
        color="gray"
        variant="outline"
        :disabled="disabled"
        type="number"
      />
      <UInput
        v-else-if="question.type === 'TEXT'"
        v-model="question.resultString as any"
        color="gray"
        :disabled="disabled"
        variant="outline"
        type="text"
      />
      <URadio
        v-for="option of booleanOptions as any"
        v-else-if="question.type === 'BOOLEAN'"
        :key="option.name"
        v-model="question.resultBoolean as any"
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
    value: null,
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
</script>
