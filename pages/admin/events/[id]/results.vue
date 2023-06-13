<template>
  <div>
    results

    {{ event }}
  </div>
</template>
  
  <script setup lang="ts">
    definePageMeta({
        middleware: ['admin'],
        layout: 'admin-event',
    })

    const route = useRoute()
    const id = route.params.id

    const { $client } = useNuxtApp()
    const { data: event } = await $client.events.getEvent.useQuery(Number(id))

    if(event.value)
    useGetResult(event.value.sections[0].questions[0])
  </script>
  
  <style scoped>
  
  </style>