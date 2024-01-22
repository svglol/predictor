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
        <div class="grid grid-cols-1 justify-items-center gap-2">
          <UBadge color="green" class="flex flex-wrap items-center">
            <Icon name="material-symbols:calendar-month" class="mr-1" />
            <NuxtTime
              :datetime="startDate ?? ''"
              minute="numeric"
              hour="numeric"
              month="numeric"
              day="numeric"
              year="numeric" />
            &nbsp;-&nbsp;
            <NuxtTime
              v-if="endDate"
              :datetime="endDate"
              minute="numeric"
              hour="numeric"
              month="numeric"
              day="numeric"
              year="numeric" />
          </UBadge>
          <UBadge
            v-if="predicionsOpen"
            color="red"
            class="flex flex-wrap items-center">
            <Icon name="material-symbols:check-box" class="mr-1" />
            Predictions close {{ timeAgo }} @&nbsp;
            <NuxtTime
              :datetime="predictionsCloseDate ?? ''"
              minute="numeric"
              hour="numeric"
              month="numeric"
              day="numeric"
              year="numeric" />
          </UBadge>
        </div>
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

const timeAgo = useTimeAgo(predictionsCloseDate.value ?? new Date())

const predicionsOpen = computed(() => {
  if (!predictionsCloseDate.value) return false
  return predictionsCloseDate.value > new Date()
})
</script>

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
