<template>
  <div class="flex flex-col gap-6">
    <HomeHero v-if="events" :events="events" />
    <div class="grid grid-cols-1 justify-items-stretch gap-6 lg:grid-cols-2">
      <HomePastEvents v-if="events" :events="events" />
      <HomeStandings v-if="events" type="alltime" :events="events" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: events } = await useClient().events.getEventsVisible.useQuery()
</script>
