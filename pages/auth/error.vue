<template>
  <div class="flex min-h-0 w-full flex-col items-center justify-center py-8">
    <h1
      class="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
      {{ error }}
    </h1>
    <p class="mt-6 text-center text-base/7 text-gray-500 dark:text-gray-400">
      Something went wrong while attempting to sign in
    </p>
    <div class="mt-10 flex items-center justify-center gap-x-6">
      <UButton size="lg" @click="handleError">Try again</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const handleError = () => clearError({ redirect: '/auth/sign-in' })

const error = useRoute().query?.error

if (!error) {
  navigateTo('/', { replace: true })
}
</script>
