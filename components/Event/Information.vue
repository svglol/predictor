<template>
  <div class="py-2">
    <div
      v-if="event?.information"
      class="prose max-w-full rounded-lg border border-gray-200 bg-white p-6 shadow dark:prose-invert focus:outline-none dark:border-gray-700 dark:bg-gray-800"
      v-html="event.information"></div>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()
</script>
