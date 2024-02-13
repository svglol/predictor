<template>
  <div v-if="section" class="flex flex-col space-y-2">
    <div class="flex flex-col">
      <span class="text-xl text-black dark:text-white">
        {{ section.heading }}
      </span>
      <span class="text-sm font-bold">{{ section.description }}</span>
    </div>

    <template v-for="(question, i) in section.questions" :key="question.id">
      <FormQuestion
        :question="question"
        :form-question="formSection.entryQuestions[i]" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { section, formSection } = defineModels<{
  section: Section
  formSection: FormSection
}>()
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
