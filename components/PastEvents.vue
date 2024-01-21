<template>
  <UCard
    :ui="{
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
    }">
    <template #header>
      <h2
        class="flex flex-row justify-between text-xl font-bold text-gray-700 dark:text-gray-300">
        {{ year }} Past Events
        <USelect v-model="year" size="xs" :options="years" />
      </h2>
    </template>

    <div
      class="grid grid-cols-1 justify-items-stretch gap-6 md:grid-cols-1 xl:grid-cols-2">
      <template v-for="event in finishedEvents" :key="event.id">
        <EventCard :event="event" hide-badges />
      </template>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const { events } = definePropsRefs<{
  events: EventCard[]
}>()

const finishedEvents = computed(() => {
  return (
    events.value
      ?.filter(event => {
        if (event.endDate === null) return false
        if (
          event.endDate.getFullYear() === Number(year.value) ||
          year.value === 'All'
        )
          return event.endDate < new Date()
      })
      .sort(
        (a, b) => (b.endDate?.getTime() ?? 0) - (a.endDate?.getTime() ?? 0)
      ) ?? []
  )
})

const years: Ref<string[]> = ref([])
if (events.value) {
  years.value.push('All')
  events.value.forEach(event => {
    if (
      event.endDate &&
      !years.value.includes(String(event.endDate.getFullYear())) &&
      event.endDate < new Date()
    ) {
      years.value.push(String(event.endDate.getFullYear()))
    }
  })
}

const year = ref(years.value[0])
</script>
