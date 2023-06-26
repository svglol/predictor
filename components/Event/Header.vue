<template>
  <div class="flex flex-col items-center space-y-2">
    <span class="text-center text-4xl font-bold text-black dark:text-white">{{
      eventName
    }}</span>
    <ClientOnly>
      <span class="text-sm font-semibold"
        ><NuxtTime
          :datetime="event.event_start_date ?? ''"
          date-style="medium"
          time-style="medium" />
        -
        <NuxtTime
          :datetime="event.event_end_date ?? ''"
          date-style="medium"
          time-style="medium"
      /></span>
      <template #fallback>
        <USkeleton class="h-4 w-[300px] bg-gray-300 dark:bg-gray-600" />
      </template>
    </ClientOnly>
    <span class="font-light text-black dark:text-white">{{
      eventDescription
    }}</span>
    <ClientOnly>
      <UBadge v-if="predicionsOpen" color="red">
        <div>
          <span>Predictions close {{ timeAgo }} @ </span>
          <NuxtTime
            :datetime="event.predictions_close_date ?? ''"
            date-style="medium"
            time-style="medium"
          />
        </div>
      </UBadge>
      <template #fallback>
        <USkeleton
          v-if="predicionsOpen"
          class="h-4 w-[200px] bg-gray-300 dark:bg-gray-600"
        />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

const eventName = computed(() => {
  return event.value?.name ?? ""
})

const eventDescription = computed(() => {
  return event.value.description ?? ""
})

const timeAgo = useTimeAgo(event.value?.predictions_close_date ?? new Date())

const predicionsOpen = computed(() => {
  if (event.value.predictions_close_date === null) return false
  return event.value.predictions_close_date > new Date()
})
</script>

<style scoped></style>
