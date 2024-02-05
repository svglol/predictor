<template>
  <Transition>
    <UFormGroup
      :name="question.question ?? ''"
      :label="question.question ?? ''"
      :error="valid"
      :ui="{
        label: { wrapper: '!justify-normal gap-2' },
      }"
      required>
      <template #hint>
        <div
          v-if="question.hint && question.hint !== ''"
          class="contents items-center gap-1">
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
          }" />
      </template>
      <template v-else-if="question.type === 'TIME'">
        <UInput
          v-model="answerString"
          v-maska
          color="gray"
          variant="outline"
          type="text"
          data-maska="##:##:##"
          placeholder="hh:mm:ss" />
      </template>
      <template v-else-if="question.type === 'NUMBER'">
        <UInput
          v-model="answerNumber"
          color="gray"
          variant="outline"
          type="number" />
      </template>
      <template v-else-if="question.type === 'TEXT'">
        <UInput
          v-model="answerString"
          color="gray"
          variant="outline"
          type="text" />
      </template>
      <template v-else-if="question.type === 'BOOLEAN'">
        <URadio
          v-for="option of booleanOptions"
          :key="option.name"
          v-model="answerBoolean"
          v-bind="option" />
      </template>
    </UFormGroup>
  </Transition>
</template>

<script setup lang="ts">
const { question, formQuestion } = $defineProps<{
  question: questionWithResult
  formQuestion: FormQuestion
}>()

const booleanOptions = [
  {
    name: `yes-${question.id}`,
    value: true,
    label: 'Yes',
  },
  {
    name: `no-${question.id}`,
    value: false,
    label: 'No',
  },
]

const formQuestionRef = $$(formQuestion)
const emit = defineEmits(['updateQuestion'])

const answerString = ref(formQuestion.answerString ?? '')
const answerBoolean = ref(formQuestion.answerBoolean ?? false)
const answerNumber: Ref<number | string> = ref(formQuestion.answerNumber ?? '')

const optionSetsNames = ref(
  question.optionSet?.options
    .map(({ id, title: label, order }) => ({
      value: id,
      label,
      order,
    }))
    .sort((a, b) => a.order - b.order) ?? []
)

const optionSetSelected = ref(optionSetsNames.value[0]?.value)

if (formQuestion.answerOption) {
  optionSetSelected.value =
    optionSetsNames.value.findLast(
      ({ value }) => value === formQuestion.answerOption
    )?.value ?? optionSetsNames.value[0].value
}

const valid = ref('')

watch([answerString, answerNumber, answerBoolean, optionSetSelected], () => {
  if (checkValidation()) {
    updateQuestion()
    emit('updateQuestion', formQuestionRef.value)
  }
})

function updateQuestion() {
  if (question.type === 'MULTI') {
    formQuestionRef.value.answerOption = Number(optionSetSelected.value)
  } else if (question.type === 'TIME') {
    formQuestionRef.value.answerString = answerString.value
  } else if (question.type === 'NUMBER') {
    if (answerNumber.value === '') {
      formQuestionRef.value.answerNumber = undefined
    } else {
      formQuestionRef.value.answerNumber = Number(answerNumber.value)
    }
  } else if (question.type === 'BOOLEAN') {
    formQuestionRef.value.answerBoolean = answerBoolean.value
  } else if (question.type === 'TEXT') {
    formQuestionRef.value.answerString = answerString.value
  }
  emit('updateQuestion', formQuestionRef.value)
}

onMounted(() => {
  updateQuestion()
})

function checkValidation() {
  formQuestionRef.value.valid = false
  valid.value = ''
  if (question.type === 'TEXT') {
    if (answerString.value === '') {
      valid.value = 'This field is required'
      return false
    }
  } else if (question.type === 'NUMBER') {
    if (answerNumber.value === '') {
      valid.value = 'This field is required'
      return false
    }
  } else if (question.type === 'TIME') {
    if (
      !/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/.test(
        answerString.value
      )
    ) {
      valid.value = 'Not a valid time - must be hh:mm:ss'
      return false
    }
  } else if (question.type === 'MULTI') {
    if (!optionSetSelected.value) {
      valid.value = 'This field is required'
      return false
    }
  }
  formQuestionRef.value.valid = true
  return true
}

const { $bus } = useNuxtApp()

$bus.$on('checkValidation', () => {
  checkValidation()
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
