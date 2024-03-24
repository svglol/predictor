<template>
  <div
    class="bg-whiteshadow flex flex-col divide-y divide-gray-200 shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800"
  >
    <span class="p-4 text-xl text-black dark:text-white">
      {{ section.heading }}
    </span>
    <div class="flex flex-col space-y-2 p-4">
      <template v-for="question in section.questions" :key="question.id">
        <AdminEventResultQuestion :question="question" :disabled="disabled" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { section, disabled } = defineModels<{
  section: Section
  disabled: boolean
}>()
</script>
