<template>
  <UContainer>entries</UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))

useHead({
  title: event.value?.name + " - Entries",
})
</script>

<style scoped></style>
