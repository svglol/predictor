<template>
  <UButton
    :loading="loading"
    :variant="variant"
    :icon="icon"
    :label="label"
    :color="color"
    @click="open"
  />
</template>

<script lang="ts" setup>
import type { ButtonColor } from '#ui/types'
import type { UploadApiResponse } from 'cloudinary'

const emit = defineEmits<{
  (e: 'upload', data: Ref<UploadApiResponse>): void
}>()

$defineProps<{
  label?: string
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'soft'
  icon?: string
  color?: ButtonColor
}>()

const loading = ref(false)

const { open, onChange } = useFileDialog({
  accept: 'image/*',
  directory: false,
  multiple: false,
})

onChange(async (files) => {
  if (!files?.length)
    return
  loading.value = true
  const formData = new FormData()
  formData.append('file', files[0])
  const { data } = (await useFetch('/api/upload', {
    method: 'POST',
    body: formData,
  })) as { data: Ref<UploadApiResponse> }
  loading.value = false
  emit('upload', data)
})
</script>
