<template>
  <div class="rounded-t-lg bg-gray-100 shadow dark:bg-gray-800">
    <div class="relative h-60">
      <NuxtImg
        v-if="image"
        width="1920"
        height="1080"
        fit="cover"
        :src="image"
        placeholder
        provider="cloudinary"
        class="absolute inset-0 h-full w-full rounded-t-lg object-cover"
        style="aspect-ratio: 1920 / 1080; object-fit: cover" />
      <div
        class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-t-lg bg-black bg-opacity-50 p-4 text-center text-white md:px-4">
        <h1 class="text-4xl font-bold">
          {{ name }}
        </h1>
        <p class="text-xl font-light">
          {{ description }}
        </p>
        <EventBadges
          :start-date="startDate"
          :end-date="endDate"
          :close-date="predictionsCloseDate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { name, description, predictionsCloseDate, startDate, endDate } =
  definePropsRefs<{
    name?: string | null
    description?: string | null
    predictionsCloseDate?: Date | null
    startDate?: Date | null
    endDate?: Date | null
    image?: string | null
  }>()
</script>

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
