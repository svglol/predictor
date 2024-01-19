<template>
  <div
    v-if="title !== 'Memespeak Predictor'"
    class="h-full w-full bg-black bg-cover bg-center"
    :style="src ? `background-image: url(${src})` : ''">
    <div class="p-12">
      <div class="flex flex-row items-center gap-4">
        <Logo />
        <h1 class="text-4xl text-white">Memespeak Predictor</h1>
      </div>
      <div class="relative mt-16 flex h-full flex-col" style="z-index: 10">
        <div>
          <h1 class="mb-12 text-7xl text-white">
            {{ title }}
          </h1>
          <div
            v-if="description !== 'Memespeak Predictor'"
            class="max-w-4xl text-5xl leading-tight text-white/90"
            v-html="description" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full w-full bg-neutral-900">
    <div class="mx-auto my-auto p-12">
      <div class="flex flex-row items-center gap-4">
        <Logo :height="100" :width="100" />
        <h1 class="text-6xl text-white">Memespeak Predictor</h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

$defineProps<{
  title?: String
  description?: String
  src?: String
}>()
</script>
