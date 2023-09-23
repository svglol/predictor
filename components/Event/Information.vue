<template>
  <div class="py-2">
    <div
      v-if="event.information"
      class="prose max-w-full dark:prose-invert focus:outline-none"
      v-html="event.information"></div>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()
</script>
