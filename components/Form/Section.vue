<template>
  <div v-if="sectionRef" class="flex flex-col space-y-2">
    <div class="flex flex-col">
      <span class="text-xl text-black dark:text-white">{{
        sectionRef.heading
      }}</span>
      <span class="text-sm font-bold">{{ sectionRef.description }}</span>
    </div>

    <template v-for="(question, i) in sectionRef.questions" :key="question.id">
      <FormQuestion
        :question="question"
        :form-question="formSection.entryQuestions[i]"
        @update-question="updateQuestion"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const { section, formSection } = $defineProps<{
  section: Section
  formSection: FormSection
}>()

const sectionRef = $$(section)
const formSectionRef = $$(formSection)
const emit = defineEmits(["updateSection"])

function updateQuestion(formQuestion: FormQuestion) {
  const questionIndex = formSectionRef.value.entryQuestions.findIndex(
    (question) => question.id === formQuestion.id,
  )
  formSectionRef.value.entryQuestions[questionIndex] = formQuestion
  emit("updateSection", formSectionRef.value)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
