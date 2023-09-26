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
const { $client } = useNuxtApp()
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

if (callbackUrl.value) {
  if (callbackUrl.value.includes('/event/')) {
    const eventID = callbackUrl.value.toString().split('/event/')[1]
    const event = await $client.events.getPublicEvent.query(Number(eventID))
    if (event) {
      useSeoMeta({
        title: event.name,
        twitterTitle: event.name,
        twitterImage: event.image ?? '/icon.png',
        ogImage: event.image ?? '/icon.png',
        twitterCard: 'summary_large_image',
      })
    }
  }
  if (callbackUrl.value.includes('/i/')) {
    const inviteID = callbackUrl.value.toString().split('/i/')[1]
    const event = await $client.events.getPublicEventByInvite.query(inviteID)
    if (event) {
      useSeoMeta({
        title: event.name,
        twitterTitle: event.name,
        twitterImage: event.image ?? '/icon.png',
        ogImage: event.image ?? '/icon.png',
        twitterCard: 'summary_large_image',
      })
    }
  }
}
</script>
