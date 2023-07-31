<template>
  <NuxtLayout name="default">
    <div class="flex flex-col justify-center place-self-center">
      <h1
        class="from-primary-400 to-primary-600 bg-gradient-to-r bg-clip-text text-center text-[12rem] font-extrabold text-transparent"
      >
        {{ error.statusCode }}
      </h1>
      <span class="pb-5 text-center text-2xl font-light">{{
        error.message
      }}</span>
      <div class="place-self-center">
        <UButton size="xl" @click="handleError">Return home</UButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
const { error } = definePropsRefs<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>
