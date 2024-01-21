<template>
  <div class="flex flex-col gap-4">
    <UCard
      v-if="ongoingEvents.length > 0"
      :ui="{
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }">
      <template #header>
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
          Current Events
        </h2>
      </template>

      <div class="grid grid-cols-1 justify-items-stretch gap-6">
        <template v-for="event in ongoingEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
    </UCard>
    <UCard
      v-if="upcomingEvents.length > 0"
      :ui="{
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }">
      <template #header>
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
          Upcoming Events
        </h2>
      </template>

      <div class="grid grid-cols-1 justify-items-stretch gap-6">
        <template v-for="event in upcomingEvents" :key="event.id">
          <EventCard :event="event" />
        </template>
      </div>
    </UCard>
    <UCard
      v-if="finishedEvents.length > 0"
      :ui="{
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }">
      <template #header>
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
          Past Events
        </h2>
      </template>

      <div
        class="grid grid-cols-1 justify-items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        <template v-for="event in finishedEvents" :key="event.id">
          <EventCard :event="event" hide-badges />
        </template>
      </div>
    </UCard>
    <div class="grid grid-cols-1 justify-items-stretch gap-6 lg:grid-cols-2">
      <Standings type="currentyear" />
      <Standings type="alltime" />
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
