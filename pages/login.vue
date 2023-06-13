<template>
  <UContainer>
    <div
      class="mx-auto my-auto flex h-screen flex-col items-center justify-center space-y-2"
    >
      <Logo />
      <UButton color="purple" @click="signIn('discord')">
        Sign in with Discord
        <Icon name="fa6-brands:discord" />
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
  layout: false,
})
const { signIn } = useAuth()
</script>
