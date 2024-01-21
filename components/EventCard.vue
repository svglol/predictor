<template>
  <NuxtLink
    :to="'/event/' + event.id"
    :class="{ 'bg-gray-700 hover:bg-gray-800': event.image }"
    class="flex h-full w-full flex-col items-center rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
    <div class="grid h-full w-full">
      <div
        class="content z-10 my-auto flex h-full flex-col items-center justify-center space-y-2 p-4">
        <h5
          :class="{
            'text-black dark:text-white': !event.image,
            'text-white': event.image,
          }"
          class="text-xl font-bold md:text-2xl">
          {{ event.name }}
        </h5>
        <UBadge v-if="!hideBadges" color="green">
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
        <UBadge v-if="predicionsOpen && !hideBadges" color="red">
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
      <div
        :class="{ 'bg-black opacity-40': event.image }"
        class="overlay z-0 h-44 rounded-lg">
        <NuxtImg
          v-if="event.image"
          :src="event.image"
          provider="cloudinary"
          :placeholder="[312, 44, 75, 100]"
          fit="thumbnail"
          width="1246"
          height="176"
          :alt="event.name ?? ''"
          :modifiers="{ gravity: 'center' }"
          :sizes="{ xs: '100vw', sm: '100vw', md: '100vw', lg: '100vw' }"
          class="h-44 w-full rounded-lg object-cover" />
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

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
