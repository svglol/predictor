<template>
  <UInput
    id="uploader"
    ref="file"
    type="file"
    name="file"
    class="hidden"
    accept="image/*"
    @change="handleFormData" />
  <UButton
    :loading="loading"
    :variant="variant"
    :icon="icon"
    :label="label"
    :color="color"
    @click="getFile" />
</template>

<script lang="ts" setup>
import type { ButtonVariant } from '@nuxt/ui/dist/runtime/types/button'
import type { UploadApiResponse } from 'cloudinary'

const emit = defineEmits<{
  (e: 'upload', data: Ref<UploadApiResponse>): void
}>()

$defineProps<{
  label?: string
  variant?: ButtonVariant
  icon?: string
  color?: string
}>()

const loading = ref(false)

async function handleFormData(e: HTMLInputEvent | DragEvent) {
  const files =
    (e as HTMLInputEvent).target.files || (e as DragEvent).dataTransfer?.files
  if (!files?.length) return
  loading.value = true
  const formData = new FormData()
  formData.append('file', files[0])
  const { data }: { data: Ref<UploadApiResponse> } = await useFetch(
    '/api/upload',
    {
      method: 'POST',
      body: formData,
    }
  )
  loading.value = false
  emit('upload', data)
}

const getFile = function () {
  const fileUpload = document.getElementById('uploader')
  if (fileUpload != null) {
    fileUpload.click()
  }
}
</script>
