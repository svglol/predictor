<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Current/Upcoming Events
      </h2>
      <div class="grid grid-cols-4 space-x-2 space-y-2">
        <template v-for="event in newEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
      <template v-if="newEvents.length === 0">
        <span>No Events</span>
      </template>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Finished Events
      </h2>
      <div class="grid grid-cols-4 space-x-2 space-y-2">
        <template v-for="event in oldEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
      <template v-if="oldEvents.length === 0">
        <span>No Events</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
// const { session: user } = useAuth()

const { data: events } = await $client.events.getEventsVisible.useQuery()

const oldEvents = computed(() => {
  return events.value?.filter((event) => {
    if (event.event_end_date === null) return false
    return event.event_end_date < new Date()
  })
})

const newEvents = computed(() => {
  return events.value?.filter((event) => {
    if (event.event_end_date === null) return false
    return event.event_end_date >= new Date()
  })
})
</script>
