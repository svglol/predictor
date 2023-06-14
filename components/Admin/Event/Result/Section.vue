<template>
  <div
    class="bg-whiteshadow my-4 flex flex-col divide-y divide-gray-200 rounded-lg shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800"
  >
    <span class="p-4 text-xl text-black dark:text-white">{{
      sectionRef.heading
    }}</span>
    <div class="flex flex-col space-y-2 p-4">
      <template v-for="question in sectionRef.questions" :key="question.id">
        <AdminEventResultQuestion
          :question="question"
          @update-question="updateQuestion"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Prisma } from "@prisma/client"

const sectionWithQuestion = Prisma.validator<Prisma.EventSectionArgs>()({
  include: { questions: { include: { resultOption: true } } },
})
type SectionWithQuestion = Prisma.EventSectionGetPayload<
  typeof sectionWithQuestion
>

const { section } = $defineProps<{
  section: SectionWithQuestion
}>()

const sectionRef = $$(section)

const emit = defineEmits(["updateSection"])

watchDeep(
  () => sectionRef,
  (sectionRef) => {
    emit("updateSection", sectionRef.value)
  }
)

const questionWithResult = Prisma.validator<Prisma.QuestionArgs>()({
  include: { resultOption: true, optionSet: { include: { options: true } } },
})
type questionWithResult = Prisma.QuestionGetPayload<typeof questionWithResult>

function updateQuestion(updatedQuestion: questionWithResult) {
  const questionIndex = sectionRef.value.questions.findIndex(
    (question) => question.id === updatedQuestion.id
  )
  sectionRef.value.questions[questionIndex] = updatedQuestion
}
</script>

<style></style>
