<template>
  <div class="mt-2 grid grid-cols-1 justify-items-center gap-2">
    <UBadge color="green" class="flex flex-row items-center">
      <Icon name="material-symbols:calendar-month" class="mr-1" />
      <div class="flex flex-wrap">
        <NuxtTime
          class="contents"
          :datetime="event?.startDate ?? startDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
        &nbsp;-&nbsp;
        <NuxtTime
          v-if="event?.endDate ?? endDate"
          class="contents"
          :datetime="event?.endDate ?? endDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </div>
    </UBadge>
    <UBadge
      v-if="
        predictionsOpenForEvent(event?.closeDate ?? closeDate ?? new Date())
      "
      color="red"
      class="flex flex-row items-center">
      <Icon name="material-symbols:check-box" class="mr-1" />

      <div class="flex flex-wrap">
        Predictions close
        {{ timeAgoForEvent(event?.closeDate ?? closeDate ?? new Date()) }}
        @&nbsp;
        <NuxtTime
          class="contents"
          :datetime="event?.closeDate ?? closeDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </div>
    </UBadge>
  </div>
</template>

<script setup lang="ts">
const { event, startDate, endDate, closeDate } = definePropsRefs<{
  event?: EventCard
  startDate?: Date | null
  endDate?: Date | null
  closeDate?: Date | null
}>()

function timeAgoForEvent(closeDate: Date) {
  return useTimeAgo(closeDate).value
}

function predictionsOpenForEvent(closeDate: Date) {
  if (closeDate === null) return false
  return closeDate > new Date()
}
</script>
