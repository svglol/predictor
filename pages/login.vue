<template>
  <UContainer>
    <div
      class="mx-auto my-auto flex h-screen flex-col items-center justify-center space-y-2"
    >
      <Logo :height="100" :width="100" />
      <UButton
        size="xl"
        @click="
          signIn('discord'), { callbackUrl: route.query.callbackUrl ?? '/' }
        "
      >
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
const { signIn, status } = useAuth()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const cookie = useCookie("next-auth.callback-url")
cookie.value =
  runtimeConfig.public.authJs.baseUrl + route.query.callbackUrl ?? "/"

if (status.value === "authenticated") {
  navigateTo("/", {
    replace: true,
  })
}
</script>
