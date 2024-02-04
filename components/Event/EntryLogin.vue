<template>
  <div class="flex w-full items-center">
    <div
      class="mx-auto my-auto flex flex-col items-center justify-center gap-4">
      <span class="text-xl">You need to be logged in to submit an entry!</span>
      <UButton size="xl" color="gray" @click="signIn()">Sign in</UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { signIn } = useAuth()
</script>
