<template>
  <div class="mt-4 py-2">
    <div
      v-if="information"
      class="prose m-5 max-w-full dark:prose-invert focus:outline-none"
      v-html="information"></div>
  </div>
</template>

<script setup lang="ts">
const { information } = definePropsRefs<{
  information: string | null | undefined
}>()
</script>
