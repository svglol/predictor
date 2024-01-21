<template>
  <NuxtLink
    :to="'/event/' + event.id"
    class="rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
    <div class="h relative h-[180px] w-full md:h-[180px] lg:h-[180px]">
      <NuxtImg
        v-if="event.image"
        width="1920"
        height="1080"
        fit="cover"
        :src="event.image"
        placeholder
        provider="cloudinary"
        class="absolute inset-0 h-full w-full rounded-lg object-cover"
        style="aspect-ratio: 1920 / 1080; object-fit: cover" />
      <div
        class="relative z-10 flex h-full flex-col items-center justify-center rounded-lg bg-black bg-opacity-50 p-4 text-center text-white hover:bg-opacity-40 md:px-4">
        <h1 class="text-2xl">
          {{ event.name }}
        </h1>
        <div
          v-if="!hideBadges"
          class="mt-4 grid grid-cols-1 justify-items-center gap-2">
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
            v-if="predicionsOpen"
            color="red"
            class="flex flex-wrap items-center">
            <Icon name="material-symbols:check-box" class="mr-1" />
            Predictions close {{ timeAgo }} @&nbsp;
            <NuxtTime
              :datetime="event.closeDate ?? ''"
              minute="numeric"
              hour="numeric"
              month="numeric"
              day="numeric"
              year="numeric" />
          </UBadge>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
  hideBadges?: boolean
}>()

const timeAgo = useTimeAgo(event.value?.closeDate ?? new Date())

const predicionsOpen = computed(() => {
  if (event.value.closeDate === null) return false
  return event.value.closeDate > new Date()
})
</script>
