<template>
  <div class="h-full w-full bg-neutral-900">
    <div
      class="absolute left-[-100%] top-0 flex"
      :style="{
        width: '200%',
        height: '200%',
        backgroundImage: `radial-gradient(circle, rgba(5,5,5, 0.5) 0%,  rgba(5, 5, 5,0.3)  70%, rgba(5, 5, 5,0) 100%)`,
      }" />

    <div class="flex h-full flex-col justify-between p-12 backdrop-blur-lg">
      <div class="flex flex-row items-center gap-4">
        <img v-if="src" :src="imgUrl" class="h-24 w-24 rounded-full" />
        <h1 class="mb-4 text-7xl text-white">{{ title }}</h1>
      </div>
      <div class="flex flex-row items-center gap-4">
        <img src="/icon.png" class="h-8 w-8" />
        <h1 class="text-4xl font-light text-white">Memespeak Predictor</h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const { src } = $defineProps<{
  title?: String
  src?: String
}>()
const imgUrl = ref('')
if (src) {
  const img = useImage()
  imgUrl.value = img(src as string, { format: 'png' })
  if (imgUrl.value.endsWith('.gif')) {
    imgUrl.value = src.replace('.gif', '.png')
  }
}
</script>
