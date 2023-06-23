<template>
  <NuxtLink
    :to="'/event/' + event.id"
    class="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:max-w-xl md:flex-row"
  >
    <div class="flex flex-col p-4">
      <h5 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ event.name }}
      </h5>
      <p class="text-xs font-bold text-gray-700 dark:text-gray-400">
        <NuxtTime
          :datetime="event.event_start_date ?? ''"
          date-style="medium"
          time-style="medium"
        />
        -
        <NuxtTime
          :datetime="event.event_end_date ?? ''"
          date-style="medium"
          time-style="medium"
        />
      </p>
      <span
        v-if="predicionsOpen"
        class="mb-2 text-sm text-red-600 dark:text-red-400"
      >
        Predictions close {{ timeAgo }}
      </span>
      <p
        v-if="event.description"
        class="mb-2 font-normal text-gray-700 dark:text-gray-400"
      >
        {{ event.description }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
}>()

const timeAgo = useTimeAgo(event.value?.predictions_close_date ?? new Date())

const predicionsOpen = computed(() => {
  if (event.value.predictions_close_date === null) return false
  return event.value.predictions_close_date > new Date()
})
</script>

<style></style>
