<template>
  <div
    class="mx-auto my-auto flex flex-col items-center justify-center space-y-2">
    <div
      class="flex min-w-96 flex-col items-center gap-2 rounded-lg border border-gray-300 p-4 dark:border-gray-700">
      <span class="text-2xl font-bold text-gray-900 dark:text-white">
        <Icon name="material-symbols:lock" />
        Sign in
      </span>
      <UDivider />
      <UButton color="white" @click="signIn('discord'), { callbackUrl }">
        <Icon name="fa6-brands:discord" />
        Continue with Discord
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'base',
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
