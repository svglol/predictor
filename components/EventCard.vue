<template>
  <NuxtLink
    :to="'/event/' + event.id"
    :class="{ 'bg-gray-700 hover:bg-gray-800': event.image }"
    class="flex h-full w-full flex-col items-center rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
    <div class="grid h-full w-full">
      <div
        class="content z-20 my-auto flex h-full flex-col items-center justify-center space-y-2 p-4">
        <h5 class="text-xl font-bold text-white">
          {{ event.name }}
        </h5>
        <UBadge color="green">
          <NuxtTime
            :datetime="event.startDate ?? ''"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric" />
          @&nbsp;-@&nbsp;
          <NuxtTime
            v-if="event.endDate"
            :datetime="event.endDate"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric" />
        </UBadge>
        <UBadge v-if="predicionsOpen" color="red">
          Predictions close {{ timeAgo }}
        </UBadge>
      </div>
      <div class="overlay z-0 rounded-lg bg-black opacity-40">
        <NuxtImg
          v-if="event.image"
          :src="event.image"
          class="max-h-44 w-full rounded-lg object-cover" />
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

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
