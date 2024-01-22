<template>
  <div class="mt-2 grid grid-cols-1 justify-items-center gap-2">
    <UBadge color="green" class="flex flex-wrap items-center">
      <Icon name="material-symbols:calendar-month" class="mr-1" />
      <NuxtTime
        :datetime="event.startDate ?? ''"
        minute="numeric"
        hour="numeric"
        month="numeric"
        day="numeric"
        year="numeric" />
      &nbsp;-&nbsp;
      <NuxtTime
        v-if="event.endDate"
        :datetime="event.endDate"
        minute="numeric"
        hour="numeric"
        month="numeric"
        day="numeric"
        year="numeric" />
    </UBadge>
    <UBadge
      v-if="predictionsOpenForEvent(event)"
      color="red"
      class="flex flex-wrap items-center">
      <Icon name="material-symbols:check-box" class="mr-1" />
      Predictions close
      {{ timeAgoForEvent(event) }}
      @&nbsp;
      <NuxtTime
        :datetime="event.closeDate ?? ''"
        minute="numeric"
        hour="numeric"
        month="numeric"
        day="numeric"
        year="numeric" />
    </UBadge>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
}>()

function timeAgoForEvent(event: EventCard) {
  return useTimeAgo(event.closeDate ?? new Date()).value
}

function predictionsOpenForEvent(event: EventCard) {
  if (event.closeDate === null) return false
  return event.closeDate > new Date()
}
</script>
