<template>
  <div class="flex w-full items-center">
    <div class="flex min-h-0 w-full flex-col items-center justify-center py-8">
      <h1
        class="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
        Sign in
      </h1>
      <p class="mt-6 text-center text-base/7 text-gray-500 dark:text-gray-400">
        To complete your prediction please sign in.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <UButton size="lg" @click="signIn()">Sign in</UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { signIn } = useAuth()
</script>
