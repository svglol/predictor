<template>
  <template v-if="title === 'Image'">
    <UIUpload variant="ghost" :icon="`ri:${icon}`" @upload="uploaded" />
  </template>
  <template v-else>
    <UButton
      class="menu-item text-lg"
      :class="{ 'bg-gray-300 dark:bg-gray-700': isActive ? isActive() : null }"
      :title="title"
      variant="ghost"
      @click="action"
    >
      <UIcon :name="`ri:${icon}`" />
    </UButton>
  </template>
</template>

<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'

const { icon, title, action, isActive, uploaded } = $defineProps<{
  icon?: string
  title?: string
  action?: () => void
  isActive?: () => boolean | undefined
  type?: string
  uploaded?: (e: Ref<UploadApiResponse>) => void
}>()
</script>
