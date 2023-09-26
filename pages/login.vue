<template>
  <UContainer>
    <div
      class="mx-auto my-auto flex h-screen flex-col items-center justify-center space-y-2">
      <Logo :height="100" :width="100" />
      <UButton
        size="xl"
        @click="signIn('discord'), { callbackUrl: callbackUrl }">
        Sign in with Discord
        <Icon name="fa6-brands:discord" />
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
const { signIn, status } = useAuth()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const cookie = useCookie('next-auth.callback-url', {
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
})
const secureCookie = useCookie('__Secure-next-auth.callback-url', {
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
})
const callbackUrl = ref(route.query?.callbackUrl)
if (callbackUrl.value === undefined) {
  callbackUrl.value = '/'
}
cookie.value = runtimeConfig.public.authJs.baseUrl + callbackUrl.value
secureCookie.value = runtimeConfig.public.authJs.baseUrl + callbackUrl.value

if (status.value === 'authenticated') {
  navigateTo(callbackUrl.value?.toString(), {
    replace: true,
  })
}
</script>
