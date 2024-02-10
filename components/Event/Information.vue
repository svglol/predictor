<template>
  <div
    v-if="information"
    class="prose max-w-full dark:prose-invert focus:outline-none"
    v-html="information" />
</template>

<script setup lang="ts">
const { information } = definePropsRefs<{
  information: string | null | undefined
}>()
</script>
