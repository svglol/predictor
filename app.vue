<script setup lang="ts"></script>

<template>
  <NuxtLayout
    class="bg-white font-sans text-gray-500 antialiased transition-colors duration-300 dark:bg-gray-900 dark:text-gray-400"
  >
    <NuxtLoadingIndicator :color="false" class="bg-primary-500" />
    <NuxtPage />
    <UNotifications />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - Memespeak Predictor`
      : " Memespeak Predictor"
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
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
