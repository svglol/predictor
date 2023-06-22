<template>
  <NuxtLink
    :to="'/event/' + event.id"
    class="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:max-w-xl md:flex-row"
  >
    <div class="flex flex-col p-4">
      <h5 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        {{ event.name }}
      </h5>
      <p
        v-if="event.description"
        class="mb-2 font-normal text-gray-700 dark:text-gray-400"
      >
        {{ event.description }}
      </p>
      <p class="text-xs font-bold text-gray-700 dark:text-gray-400">
        {{ useDateFormat(event.event_start_date ?? "", "DD-MM-YYYY").value }} -
        {{ useDateFormat(event.event_end_date ?? "", "DD-MM-YYYY").value }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
}>()
</script>

<style></style>
