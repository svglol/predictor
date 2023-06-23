<template>
  <div class="flex flex-col items-center space-y-2">
    <span class="text-2xl font-light text-black dark:text-white">{{
      eventName
    }}</span>
    <ClientOnly>
      <span class="text-xs font-bold"
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
        <USkeleton class="h-4 w-[200px] bg-gray-300 dark:bg-gray-600" />
      </template>
    </ClientOnly>
    <span>{{ eventDescription }}</span>
    <ClientOnly>
      <UBadge v-if="predicionsOpen" color="red">
        Predictions close {{ timeAgo }} @
        <NuxtTime
          :datetime="event.predictions_close_date ?? ''"
          date-style="medium"
          time-style="medium"
        />
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
