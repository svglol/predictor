<template>
  <div v-if="user" class="flex flex-col gap-2">
    <div
      class="mx-auto flex h-fit w-full flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 p-6 shadow dark:border-gray-700 dark:bg-gray-800"
    >
      <UAvatar
        :src="user.image ?? ''"
        size="3xl"
        :alt="user.name ?? ''"
        class="ring-primary-500 ring-2"
      />
      <h1 class="text-3xl text-black dark:text-white">{{ user.name ?? '' }}</h1>
      <p class="text-gray-700 dark:text-gray-400">
        {{ user.email ?? '' }}
      </p>
    </div>
    <h2
      v-if="user.entries.length > 0"
      class="text-2xl font-bold text-black dark:text-white"
    >
      Entered Events
    </h2>
    <div
      v-if="user.entries.length > 0"
      class="grid justify-items-stretch gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <EventCard
        v-for="entry in user.entries"
        :key="entry.id"
        :event="entry.event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()

const { data: user } = await $client.users.getSessionUser.useQuery()

useHead({
  title: user.value?.name ?? '',
})
</script>
