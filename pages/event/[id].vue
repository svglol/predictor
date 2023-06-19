<template>
  <div>event page - {{ event?.name }}</div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const { $client } = useNuxtApp()
const route = useRoute()
const { data: user } = useAuth()

const { data: event } = await $client.events.getEvent.useQuery(
  Number(route.params.id)
)
//check if event is valid
if (event.value === null) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" })
}

//check if user has entered
const userEntered =
  event.value.entries.filter((entry) => {
    if (entry.userId === user.value?.user?.id) {
      return true
    }
  }).length === 0

if (userEntered && user.value?.user?.role !== "ADMIN") {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" })
}

useHead({
  title: event.value.name ?? "",
})
</script>

<style scoped></style>
