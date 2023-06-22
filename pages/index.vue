<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Current/Upcoming Events
      </h2>
      <div class="grid grid-cols-4 space-x-2 space-y-2">
        <template v-for="event in currentUserEvents" :key="event.id">
          <EventCard :event="event.event" />
        </template>
      </div>
      <template v-if="currentUserEvents.length === 0">
        <span>No Events</span>
      </template>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Finished Events
      </h2>
      <div class="grid grid-cols-4 space-x-2 space-y-2">
        <template v-for="event in oldUserEvents" :key="event.id">
          <EventCard :event="event.event" />
        </template>
      </div>
      <template v-if="oldUserEvents.length === 0">
        <span>No Events</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()
const { session: user } = useAuth()

const { data: userEntries } = await $client.users.getUserEntries.useQuery(
  Number(user.value?.user?.id)
)

const oldUserEvents = computed(() => {
  return userEntries.value?.entries.filter((entry) => {
    if (entry.event.event_end_date === null) return false
    return entry.event.event_end_date < new Date()
  })
})

const currentUserEvents = computed(() => {
  return userEntries.value?.entries.filter((entry) => {
    if (entry.event.event_end_date === null) return false
    return entry.event.event_end_date >= new Date()
  })
})
</script>
