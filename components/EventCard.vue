<template>
  <NuxtLink
    :to="'/event/' + event.id"
    class="flex h-full flex-row items-baseline rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:max-w-xl"
  >
    <div class="flex flex-col space-y-1 p-4">
      <h5 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ event.name }}
      </h5>
      <USkeleton
        v-if="loading"
        class="h-4 w-[250px] bg-gray-400 dark:bg-gray-500"
      />
      <p class="text-xs font-bold text-gray-700 dark:text-gray-400">
        {{ date }}
      </p>
      <div>
        <UBadge v-if="predicionsOpen" color="red">
          Predictions close {{ timeAgo }}
        </UBadge>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: EventCard
}>()

const timeAgo = useTimeAgo(event.value?.predictions_close_date ?? new Date())

const predicionsOpen = computed(() => {
  if (event.value.predictions_close_date === null) return false
  return event.value.predictions_close_date > new Date()
})

const date = ref("")
const loading = ref(true)
onMounted(() => {
  loading.value = false
  date.value =
    useDateFormat(
      event.value.event_start_date ?? new Date(),
      "DD/MM/YYYY hh:mm:ss A"
    ).value +
    " - " +
    useDateFormat(
      event.value.event_end_date ?? new Date(),
      "DD/MM/YYYY hh:mm:ss A"
    ).value
})
</script>

<style></style>
