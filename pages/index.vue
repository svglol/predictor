<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Current/Upcoming Events
      </h2>
      <div
        class="grid justify-items-stretch gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <template v-for="event in newEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
      <template v-if="newEvents.length === 0">
        <span class="font-light">No Events</span>
      </template>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Finished Events
      </h2>
      <div
        class="grid justify-items-stretch gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <template v-for="event in oldEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
      <template v-if="oldEvents.length === 0">
        <span class="font-light">No Events</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const { data: events } = await $client.events.getEventsVisible.useQuery()

const oldEvents = computed(() => {
  return events.value?.filter(event => {
    if (event.endDate === null) return false
    return event.endDate < new Date()
  })
})

const newEvents = computed(() => {
  return events.value?.filter(event => {
    if (event.endDate === null) return false
    return event.endDate >= new Date()
  })
})
</script>
