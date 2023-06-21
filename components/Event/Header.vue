<template>
  <div class="flex flex-col items-center space-y-2">
    <span class="text-2xl font-light text-black dark:text-white">{{
      eventName
    }}</span>
    <span>{{ eventDescription }}</span>
    <div>
      <span class="font-light text-black dark:text-white">Event Date: </span>
      <span class="text-sm font-bold"
        >{{ eventStartDate }} - {{ eventEndDate }}</span
      >
    </div>
    <div>
      <span class="font-light text-black dark:text-white"
        >Predictions Close Date:
      </span>
      <span class="text-sm font-bold">{{ predicitionsCloseDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent
}>()

const eventName = computed(() => {
  return event.value?.name ?? ""
})
const eventStartDate = computed(() => {
  return useDateFormat(event.value?.event_start_date ?? "", "YYYY-MM-DD").value
})
const eventEndDate = computed(() => {
  return useDateFormat(event.value?.event_end_date ?? "", "YYYY-MM-DD").value
})

const eventDescription = computed(() => {
  return event.value.description ?? ""
})

const predicitionsCloseDate = computed(() => {
  return useDateFormat(
    event.value?.predictions_close_date ?? "",
    "YYYY-MM-DD HH:mm:ss"
  ).value
})
</script>

<style scoped></style>
