<template>
  <UButton
    class="menu-item text-lg"
    :class="{ 'bg-gray-300 dark:bg-gray-700': isActive ? isActive() : null }"
    :title="title"
    variant="ghost"
    @click="action">
    <Icon :name="`ri:${icon}`"></Icon>
  </UButton>
</template>

<script setup lang="ts">
const { icon, title, action, isActive } = $defineProps<{
  icon?: string
  title?: string
  action?: () => void
  isActive?: () => boolean | undefined
  type?: string
}>()
</script>
