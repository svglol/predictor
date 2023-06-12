<template>
  <UContainer>
    <div
      class="flex flex-col space-y-2 mx-auto items-center my-auto h-screen justify-center"
    >
      <Logo />
      <UButton
        color="purple"
        @click="signIn('discord')"
      >
        Sign in with Discord
        <Icon name="fa6-brands:discord" />
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }, layout: false })
const { signIn } = useAuth()
</script>
