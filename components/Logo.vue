<template>
  <NuxtImg
    alt="logo"
    :src="src"
    :width="width"
    :height="height"
    @mouseover="isHover = true"
    @mouseleave="isHover = false" />
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

const isHover = ref(false)

const src = computed(() => {
  return isHover.value ? '/icon-animated.gif' : '/icon.png'
})
</script>
