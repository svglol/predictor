<template>
  <UContainer>
    <div
      class="mx-auto my-auto flex h-screen flex-col items-center justify-center space-y-2"
    >
      <Logo />
      <UButton size="xl" @click="signIn('discord')">
        Sign in with Discord
        <Icon name="fa6-brands:discord" />
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
const { signIn } = useAuth()
</script>
