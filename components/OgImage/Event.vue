<template>
  <div
    class="size-full bg-neutral-900 bg-cover"
    :style="src ? `background-image: url(${imgUrl})` : ''"
  >
    <div
      class="absolute -left-full top-0 flex"
      :style="{
        width: '200%',
        height: '200%',
        backgroundImage: `radial-gradient(circle, rgba(5,5,5, 0.5) 0%,  rgba(5, 5, 5,0.3)  70%, rgba(5, 5, 5,0) 100%)`,
      }"
    />
    <div class="flex h-full flex-col justify-between p-12">
      <div>
        <h1 class="mb-4 text-7xl text-white">
          {{ title }}
        </h1>
        <div
          v-if="description !== 'Memespeak Predictor'"
          class="max-w-full text-5xl leading-tight text-white/90"
          v-html="description"
        />
      </div>
      <div class="flex flex-row items-center gap-4">
        <img src="/icon.png" class="size-8">
        <h1 class="text-4xl font-light text-white">
          Memespeak Predictor
        </h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const { src } = $defineProps<{
  title?: string
  description?: string
  src?: string
}>()
const imgUrl = ref('')
if (src) {
  const img = useImage()
  imgUrl.value = img(
    src as string,
    { fit: 'fill', width: 1200, height: 600 },
    {
      provider: 'cloudinary',
    },
  )
}
</script>
