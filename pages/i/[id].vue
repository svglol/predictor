<template>
  <div>invite landing page</div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
    return /^[a-zA-Z0-9\b]{5}$/.test(String(route.params.id))
  },
})
const route = useRoute()
const { $client } = useNuxtApp()
const { data: event, error } = await $client.events.getEventWithInvite.useQuery(
  String(route.params.id)
)
if (error.value !== null || !event.value)
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" })

//TODO check if nominations are closed
const now = new Date()
const predictionsOpen = ref(
  (event.value.predictions_close_date ?? new Date()) > now
)
console.log(predictionsOpen.value)
</script>

<style scoped></style>
