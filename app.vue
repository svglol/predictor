<script setup lang="ts"></script>

<template>
  <NuxtLayout class="antialiased font-sans text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
    <NuxtLoadingIndicator
      :color="false" 
      class="bg-primary-500"
    />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Predictor` : 'Predictor';
  }
})
</script>