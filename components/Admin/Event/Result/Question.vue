<template>
  <div>
    <UFormGroup
      :name="questionRef.question ?? ''"
      :label="questionRef.question ?? ''"
    >
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
          placeholder="hh:mm:ss"
        />
      </template>
      <template v-else-if="questionRef.type === 'NUMBER'">
        <UInput
          v-model="resultNumber"
          color="primary"
          variant="outline"
          type="number"
        />
      </template>
      <template v-else-if="questionRef.type === 'TEXT'">
        <UInput
          v-model="resultString"
          color="primary"
          variant="outline"
          type="text"
        />
      </template>
      <template v-else-if="questionRef.type === 'BOOLEAN'">
        <UCheckbox v-model="resultBoolean" />
      </template>
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
import { Prisma } from "@prisma/client"

const questionWithResult = Prisma.validator<Prisma.QuestionArgs>()({
  include: { resultOption: true, optionSet: { include: { options: true } } },
})
type questionWithResult = Prisma.QuestionGetPayload<typeof questionWithResult>

const { question } = $defineProps<{
  question: questionWithResult
}>()

const questionRef = $$(question)

const resultString = ref("")
const resultBoolean = ref(questionRef.value.resultBoolean ?? false)
const resultNumber: Ref<string | number> = ref("")

const optionSetsNames = ref(
  question.optionSet?.options.map(({ id, title: label }) => ({ id, label })) ??
    []
)
optionSetsNames.value.unshift({ id: -1, label: "None" })

const optionSetSelected = ref()

switch (question.type) {
  case "TEXT":
    resultString.value = question.resultString ?? ""
  case "NUMBER":
    resultNumber.value = question.resultNumber ?? ""
  case "BOOLEAN":
    resultBoolean.value = question.resultBoolean ?? false
  case "TIME":
    resultString.value = question.resultString ?? ""
  case "MULTI":
    optionSetSelected.value =
      optionSetsNames.value.filter(
        (optionSet) => optionSet.id === question.optionId
      )[0] ?? optionSetsNames.value[0]
}

const emit = defineEmits(["updateQuestion"])

watchDeep(
  () => resultBoolean,
  (resultBoolean) => {
    questionRef.value.resultBoolean = resultBoolean.value
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    questionRef.value.optionId = null
    emit("updateQuestion", questionRef.value)
  }
)

watchDeep(
  () => resultNumber,
  (resultNumber) => {
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    questionRef.value.optionId = null

    if (resultNumber.value !== "")
      questionRef.value.resultNumber = Number(resultNumber.value)
    emit("updateQuestion", questionRef.value)
  }
)

watchDeep(
  () => resultString,
  (resultString) => {
    questionRef.value.resultString = null
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.optionId = null

    if (resultString.value !== "")
      questionRef.value.resultString = resultString.value
    emit("updateQuestion", questionRef.value)
  }
)

watchDeep(
  () => optionSetSelected,
  (optionSetSelected) => {
    questionRef.value.optionId = optionSetSelected.value.id
    if (optionSetSelected.value.id === -1) {
      questionRef.value.optionId = null
    }
    questionRef.value.resultBoolean = null
    questionRef.value.resultNumber = null
    questionRef.value.resultString = null
    emit("updateQuestion", questionRef.value)
  }
)
</script>

<style></style>
