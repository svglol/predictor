<template>
  <div class="mt-2 grid grid-cols-1 justify-items-center gap-2">
    <UBadge
      color="primary"
      class="flex flex-row items-center"
      variant="subtle"
      :ui="{
        variant: {
          subtle:
            'bg-{color}-600 dark:bg-{color}-200 dark:bg-opacity-70 bg-opacity-70 text-white dark:text-white ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400 ring-opacity-25 dark:ring-opacity-25',
        },
      }"
    >
      <UIcon name="material-symbols:calendar-month" class="mr-1" />
      <div class="flex flex-wrap">
        <NuxtTime
          class="contents"
          :datetime="event?.startDate ?? startDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
        -
        <NuxtTime
          v-if="event?.endDate ?? endDate"
          class="contents"
          :datetime="event?.endDate ?? endDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
      </div>
    </UBadge>
    <UBadge
      v-if="
        predictionsOpenForEvent(event?.closeDate ?? closeDate ?? new Date())
      "
      :ui="{
        variant: {
          subtle:
            'bg-{color}-600 dark:bg-{color}-600 dark:bg-opacity-70 bg-opacity-70 text-white dark:text-white ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400 ring-opacity-25 dark:ring-opacity-25',
        },
      }"
      variant="subtle"
      color="primary"
      class="flex flex-row items-center"
    >
      <UIcon name="material-symbols:contract-edit" class="mr-1" />

      <div class="flex flex-wrap">
        Predictions close
        {{ timeAgoForEvent(event?.closeDate ?? closeDate ?? new Date()) }}
        @
        <NuxtTime
          class="contents"
          :datetime="event?.closeDate ?? closeDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
      </div>
    </UBadge>
  </div>
</template>

<script setup lang="ts">
const { event, startDate, endDate, closeDate } = defineProps<{
  event?: EventCard
  startDate?: Date | null
  endDate?: Date | null
  closeDate?: Date | null
}>()

function timeAgoForEvent(closeDate: Date) {
  return useTimeAgo(closeDate).value
}

function predictionsOpenForEvent(closeDate: Date) {
  if (closeDate === null)
    return false
  return closeDate > new Date()
}
</script>
