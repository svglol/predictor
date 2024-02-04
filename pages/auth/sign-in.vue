<template>
  <div
    class="mx-auto my-auto flex flex-col items-center justify-center space-y-2">
    <div
      class="flex min-w-96 flex-col items-center gap-2 rounded-lg border border-gray-300 p-4 dark:border-gray-700">
      <NuxtLink to="/" class="flex h-5 flex-row items-center gap-2 py-12">
        <Logo class="h-10 w-10" />
        <span class="text-xl font-light text-black dark:text-white">
          Memespeak Predictor
        </span>
      </NuxtLink>
      <span class="text-2xl font-semibold text-gray-900 dark:text-white">
        <Icon name="material-symbols:lock" />
        Sign in
      </span>
      <UDivider />
      <span class="text-bold text-xl text-red-500">{{ error }}</span>
      <UForm
        :schema="schema"
        :state="state"
        class="flex w-full flex-col space-y-4"
        @submit="signIn('sendgrid', { email: state.email })">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" />
        </UFormGroup>

        <UButton color="white" type="submit" class="place-self-center">
          <Icon name="material-symbols:alternate-email-rounded" />
          Continue with Email
        </UButton>
      </UForm>
      <UDivider label="or" />
      <UButton color="white" @click="signIn('discord')">
        <Icon name="fa6-brands:discord" />
        Continue with Discord
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
definePageMeta({
  layout: 'default',
})
const { signIn, status } = useAuth()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const error = useRoute().query?.error

const schema = z.object({
  email: z.string().email('Invalid email'),
})

const state = reactive({
  email: undefined,
})

const callbackUrl = ref(route.query?.callbackUrl as string | undefined)
if (!callbackUrl.value) {
  callbackUrl.value = '/'
}
if (callbackUrl.value?.includes(runtimeConfig.public.authJs.baseUrl)) {
  callbackUrl.value = (callbackUrl.value as string).replace(
    runtimeConfig.public.authJs.baseUrl,
    ''
  )
}
if (status.value === 'authenticated') {
  navigateTo(callbackUrl.value?.toString(), {
    replace: true,
  })
}
</script>
