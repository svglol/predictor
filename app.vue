<script setup lang="ts"></script>

<template>
  <NuxtLayout
    class="bg-white font-sans text-gray-500 antialiased dark:bg-gray-900 dark:text-gray-400"
  >
    <NuxtLoadingIndicator :color="false" class="bg-primary-500" />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Predictor` : "Predictor"
  },
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
