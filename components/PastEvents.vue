<template>
  <UCard
    :ui="{
      base: 'flex flex-col ',
      footer: { base: 'mt-auto items-center flex flex-col' },
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
    }">
    <template #header>
      <h2
        class="flex flex-row justify-between text-xl font-bold text-gray-700 dark:text-gray-300">
        {{ year }} Past Events
        <USelectMenu v-model="year" :options="years" size="xs">
          <template #option="{ option }">
            <span class="text-xs">{{ option }}</span>
          </template>
        </USelectMenu>
      </h2>
    </template>
    <div
      class="grid h-full grid-cols-1 justify-items-stretch gap-6 md:grid-cols-1 xl:grid-cols-2">
      <template
        v-for="event in finishedEvents.slice(6 * (page - 1), 6 * page)"
        :key="event.id">
        <EventCard :event="event" hide-badges />
      </template>
    </div>
    <template v-if="finishedEvents.length > 6" #footer>
      <UPagination
        v-model="page"
        :page-count="6"
        :total="finishedEvents.length" />
    </template>
  </UCard>
</template>

<script lang="ts" setup>
const page = ref(1)

const { events } = definePropsRefs<{
  events: EventCard[]
}>()

const finishedEvents = computed(() => {
  return (
    events.value?.filter(event => {
      if (event.endDate === null) return false
      if (
        event.endDate.getFullYear() === Number(year.value) ||
        year.value === 'All'
      )
        return event.endDate < new Date()
      return false
    }) ?? []
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
