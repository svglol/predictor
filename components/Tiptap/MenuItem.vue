<template>
  <template v-if="title === 'Image'">
    <CldUploadWidget
      v-slot="{ open }"
      :options="{
        folder: useRuntimeConfig().public.cloudinaryFolder,
        sources: ['local', 'url'],
        multiple: false,
        singleUploadAutoClose: true,
        resourceType: 'image',
      }"
      signature-endpoint="/api/sign-cloudinary-params"
      @upload="uploaded">
      <UButton
        class="menu-item text-lg"
        :class="{
          'bg-gray-300 dark:bg-gray-700': isActive ? isActive() : null,
        }"
        :title="title"
        variant="ghost"
        @click="open">
        <Icon :name="`ri:${icon}`"></Icon>
      </UButton>
    </CldUploadWidget>
  </template>
  <template v-else>
    <UButton
      class="menu-item text-lg"
      :class="{ 'bg-gray-300 dark:bg-gray-700': isActive ? isActive() : null }"
      :title="title"
      variant="ghost"
      @click="action">
      <Icon :name="`ri:${icon}`"></Icon>
    </UButton>
  </template>
</template>

<script setup lang="ts">
const { icon, title, action, isActive, uploaded } = $defineProps<{
  icon?: string
  title?: string
  action?: () => void
  isActive?: () => boolean | undefined
  type?: string
  uploaded?: (e: Ref<{ event: string; info: { secure_url: string } }>) => void
}>()
</script>
