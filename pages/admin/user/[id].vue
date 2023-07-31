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

    <div>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Entered Events
      </h2>
      <UTable :columns="columns" :rows="eventsComputed">
        <template #actions-data="{ row }">
          <UButton
            label="Edit"
            color="gray"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            :to="'/admin/event/' + row.id + '/edit'"
          />
          <UButton
            label="View"
            color="gray"
            variant="ghost"
            icon="i-heroicons-eye"
            :to="'/event/' + row.id"
          />
        </template>

        <template #date-data="{ row }">
          <NuxtTime
            :datetime="row.event_start_date"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
          />
          -
          <NuxtTime
            :datetime="row.event_end_date"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
          />
        </template>
        <template #predictions_close_date-data="{ row }">
          <NuxtTime
            :datetime="row.predictions_close_date"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
          />
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()

const { data: user } = await $client.users.getUser.useQuery(Number(id))

useHead({
  title: user.value?.name,
})

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'date',
    label: 'Date',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

const eventsComputed = computed(() => {
  return user.value?.entries.map(entry => entry.event) ?? []
})
</script>
