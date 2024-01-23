<template>
  <div class="flex w-full items-center">
    <div
      class="mx-auto my-auto flex flex-col items-center justify-center gap-4">
      <span class="text-xl">You need to be logged in to submit an entry!</span>
      <UButton size="xl" @click="signIn('discord')">
        Sign in with Discord
        <Icon name="fa6-brands:discord" />
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { signIn } = useAuth()
</script>
