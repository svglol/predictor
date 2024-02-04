<template>
  <div class="flex min-h-0 w-full flex-col items-center justify-center py-8">
    <p class="text-primary text-base font-semibold">Sign in</p>
    <h1
      class="text-xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
      Check your email for your sign in link
    </h1>
    <div class="mt-10 flex items-center justify-center gap-x-6">
      <UButton size="lg" @click="handleError">Go back home</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const handleError = () => clearError({ redirect: '/' })
</script>
