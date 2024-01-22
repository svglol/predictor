<template>
  <div class="flex flex-col gap-6">
    <NuxtLink
      :to="'/event/' + event.id"
      class="rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="relative h-[500px] w-full md:h-[600px] lg:h-[700px]">
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
          <h1 class="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">
            {{ event.name }}
          </h1>
          <p class="mt-4 text-lg md:text-xl lg:text-2xl">
            {{ event.description }}
          </p>
          <EventBadges :event="event" />
        </div>
      </div>
    </NuxtLink>
    <div
      v-if="overflowEvents.length >= 1"
      class="grid grid-cols-1 gap-6"
      :class="{
        'md:grid-cols-2 lg:grid-cols-3': overflowEvents.length >= 3,
        'md:grid-cols-2 lg:grid-cols-2': overflowEvents.length === 2,
        'md:grid-cols-1 lg:grid-cols-1': overflowEvents.length === 1,
      }">
      <template v-for="upcomingEvent in overflowEvents" :key="upcomingEvent.id">
        <NuxtLink
          :to="'/event/' + event.id"
          class="rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <div class="relative h-[200px] w-full md:h-[200px] lg:h-[200px]">
            <NuxtImg
              v-if="upcomingEvent.image"
              width="1920"
              height="200"
              fit="cover"
              placeholder
              :src="upcomingEvent.image"
              provider="cloudinary"
              class="absolute inset-0 h-full w-full rounded-lg object-cover"
              style="aspect-ratio: 1920 / 1080; object-fit: cover" />
            <div
              class="relative z-10 flex h-full flex-col items-center justify-center rounded-lg bg-black bg-opacity-50 p-4 text-center text-white hover:bg-opacity-40 md:px-4">
              <h1 class="text-3xl font-bold">
                {{ upcomingEvent.name }}
              </h1>
              <p class="mt-2 text-lg">
                {{ upcomingEvent.description }}
              </p>
              <EventBadges :event="upcomingEvent" />
            </div>
          </div>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { events } = definePropsRefs<{
  events: EventCard[]
}>()

const currentAndUpcomingEvents = computed(() => {
  return events.value
    ?.filter(event => {
      if (event.startDate === null) return false
      return event.startDate >= new Date()
    })
    .concat(
      events.value?.filter(event => {
        if (event.endDate === null || event.startDate === null) return false
        return event.startDate <= new Date() && event.endDate >= new Date()
      })
    )
    .sort(
      (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0)
    )
})

const overflowEvents = computed(() => {
  return currentAndUpcomingEvents.value?.slice(1)
})

const event = computed(() => {
  return currentAndUpcomingEvents.value?.[0] ?? events.value?.[0]
})
</script>
