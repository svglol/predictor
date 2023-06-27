<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="py-2">
    <div
      class="prose max-w-full dark:prose-invert focus:outline-none"
      v-html="event.information"
    ></div>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()
</script>

<style scoped></style>
