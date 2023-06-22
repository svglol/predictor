<template>
  <nuxt-img src="/icon.webp" :width="width" :height="height" />
</template>

<script setup lang="ts">
export interface Props {
  height?: number
  width?: number
}

withDefaults(defineProps<Props>(), {
  height: 50,
  width: 50,
})
</script>
