<template>
  <div class="flex flex-col gap-4">
    <div v-if="ongoingEvents.length > 0" class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-300">
        Ongoing Events
      </h2>
      <div class="grid grid-cols-1 justify-items-stretch gap-2">
        <template v-for="event in ongoingEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
    </div>
    <div v-if="upcomingEvents.length > 0" class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-300">
        Upcoming Events
      </h2>
      <div class="grid grid-cols-1 justify-items-stretch gap-2">
        <template v-for="event in upcomingEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
    </div>
    <div v-if="finishedEvents.length > 0" class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-300">
        Finished Events
      </h2>
      <div class="grid grid-cols-1 justify-items-stretch gap-2">
        <template v-for="event in finishedEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const { data: events } = await $client.events.getEventsVisible.useQuery()

const finishedEvents = computed(() => {
  return (
    events.value?.filter(event => {
      if (event.endDate === null) return false
      return event.endDate < new Date()
    }) ?? []
  )
})

const ongoingEvents = computed(() => {
  return (
    events.value?.filter(event => {
      if (event.endDate === null || event.startDate === null) return false
      return event.startDate <= new Date() && event.endDate >= new Date()
    }) ?? []
  )
})

const upcomingEvents = computed(() => {
  return (
    events.value?.filter(event => {
      if (event.startDate === null) return false
      return event.startDate >= new Date()
    }) ?? []
  )
})
</script>
