<template>
  <div
    class="m-auto flex flex-col items-center justify-center space-y-2"
  >
    <UCard>
      <div class="flex flex-col items-center gap-2">
        <div class="flex flex-row items-center gap-2 py-6">
          <Logo class="size-10" />
          <span class="text-xl font-light text-black dark:text-white">
            Memespeak Predictor
          </span>
        </div>
        <span class="text-lg text-gray-900 dark:text-white">
          <UIcon name="material-symbols:lock" />
          Sign in
        </span>
        <UDivider />
        <span class="text-bold text-xl text-red-500">{{ error }}</span>
        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full flex-col space-y-4"
          @submit="signIn('sendgrid', { email: state.email })"
        >
          <UFormGroup label="Email" name="email">
            <UInput v-model="state.email" />
          </UFormGroup>

          <UButton color="white" type="submit" class="place-self-center">
            <UIcon name="material-symbols:alternate-email-rounded" />
            Continue with Email
          </UButton>
        </UForm>
        <UDivider label="or" />
        <UButton color="white" @click="signIn('discord')">
          <UIcon name="fa6-brands:discord" />
          Continue with Discord
        </UButton>
      </div>
    </UCard>
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
if (!callbackUrl.value)
  callbackUrl.value = '/'

if (callbackUrl.value?.includes(runtimeConfig.public.authJs.baseUrl)) {
  callbackUrl.value = (callbackUrl.value as string).replace(
    runtimeConfig.public.authJs.baseUrl,
    '',
  )
}
if (status.value === 'authenticated') {
  navigateTo(callbackUrl.value?.toString(), {
    replace: true,
  })
}
</script>
