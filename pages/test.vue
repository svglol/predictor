<template>
  <div>
    <Upload label="Upload" @upload="uploaded" />
  </div>
</template>

<script setup lang="ts">
import type { UploadApiResponse } from 'cloudinary'

function uploaded(data: Ref<UploadApiResponse>) {
  console.log(data)
}
</script>
