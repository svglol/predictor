<template>
  <HeadlessDisclosure
    v-slot="{ open }"
    as="div"
    class="my-4 divide-y divide-gray-200 rounded-lg bg-white shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800"
  >
    <div class="flex w-full justify-between px-4 py-5 sm:px-6">
      <div class="flex flex-row items-center space-x-2">
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
        />
      </div>
      <div class="flex flex-row space-x-2">
        <UTooltip text="Duplicate">
          <UButton
            icon="i-heroicons-document-duplicate"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="duplicate"
          />
        </UTooltip>
        <UTooltip text="Delete">
          <UButton
            icon="i-heroicons-trash"
            color="gray"
            variant="ghost"
            :disabled="disabled"
            @click="() => $emit('deleteQuestion', question.id)"
          />
        </UTooltip>
        <HeadlessDisclosureButton as="template">
          <UTooltip :text="open ? 'Close' : 'Open'">
            <UButton
              icon="i-heroicons-chevron-up"
              color="gray"
              variant="ghost"
              :class="open ? 'rotate-180 transform' : ''"
            />
          </UTooltip>
        </HeadlessDisclosureButton>
      </div>
    </div>
    <HeadlessDisclosurePanel class="px-4 py-5 sm:px-6">
      <div class="flex w-full flex-col items-stretch space-y-2">
        <UFormGroup name="question_type" label="Question Type" required>
          <USelectMenu
            v-model="questionTypeSelected"
            :options="questionType"
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
            :options="optionSetsNames"
            :disabled="disabled"
          />
        </UFormGroup>

        <UFormGroup name="Points" label="Points" required>
          <UInput
            v-model="questionPoints"
            color="primary"
            variant="outline"
            type="number"
          />
        </UFormGroup>
      </div>
    </HeadlessDisclosurePanel>
  </HeadlessDisclosure>
</template>

<script setup lang="ts">
import type { EventSection, OptionSet, Question } from "@prisma/client"

const emit = defineEmits([
  "deleteQuestion",
  "updateQuestion",
  "duplicateQuestion",
])
interface Props {
  question: Question
  section: EventSection
  optionSets: OptionSet[]
  disabled: boolean
}
const props = defineProps<Props>()
const questionType = ref(["MULTI", "TIME", "NUMBER", "TEXT", "BOOLEAN"])

const optionSetsNames = ref(
  props.optionSets.map(({ id, title: label }) => ({ id, label }))
)

if (optionSetsNames.value.length === 0) {
  questionType.value.shift()
}

const questionText = ref(props.question.question ?? "")
const questionTypeSelected = ref(props.question.type ?? questionType.value[0])
const questionPoints = ref(props.question.points ?? 0)

const optionSetSelected = ref(
  optionSetsNames.value.filter(
    (optionSet) => optionSet.id === props.question.optionSetId
  )[0] ?? optionSetsNames.value[0]
)

watch(
  [questionText, questionTypeSelected, optionSetSelected, questionPoints],
  () => {
    let optionSetId: number | null = optionSetSelected.value?.id ?? -1
    if (questionTypeSelected.value !== "MULTI") {
      optionSetId = null
    }
    emit("updateQuestion", {
      id: props.question.id,
      question: questionText.value,
      type: questionTypeSelected.value,
      optionSetId: optionSetId,
      order: props.question.order,
      points: Number(questionPoints.value),
    })
  }
)

function duplicate() {
  let optionSetId: number | null = optionSetSelected.value?.id ?? -1
  if (questionTypeSelected.value !== "MULTI") {
    optionSetId = null
  }
  emit("duplicateQuestion", {
    question: questionText.value,
    type: questionTypeSelected.value,
    optionSetId: optionSetId,
    points: Number(questionPoints.value),
  })
}
</script>

<style scoped></style>
