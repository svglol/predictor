<template>
  <NuxtLink :to="'/event/' + event.id">
    <div
      class="flex h-full w-full flex-col items-center rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="flex w-full flex-col space-y-1 p-4">
        <h5 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ event.name }}
        </h5>
        <span class="text-xs font-bold text-gray-700 dark:text-gray-400">
          <NuxtTime :datetime="event.startDate" date-style="medium" time-style="medium" /> -
          <NuxtTime :datetime="event.endDate" date-style="medium" time-style="medium" />
        </span>
        <div>
          <UBadge v-if="predicionsOpen" color="red">
            Predictions close {{ timeAgo }}
          </UBadge>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
}>()

const timeAgo = useTimeAgo(event.value?.closeDate ?? new Date())

const predicionsOpen = computed(() => {
  if (event.value.closeDate === null) return false
  return event.value.closeDate > new Date()
})
</script>

<style scoped></style>
