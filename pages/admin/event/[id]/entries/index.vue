<template>
  <div>
    <UTable :rows="entriesComputed" :columns="columns" class="w-full">
      <template #user-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.user.image" :alt="row.user.name" />
          <span>{{ row.user.name }}</span>
        </div>
      </template>
      <template #id-data="{ index }">{{ index + 1 }}</template>
      <template #updated_at-data="{ row }">
        <NuxtTime
          :datetime="row.updatedAt"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </template>
      <template #created_at-data="{ row }">
        <NuxtTime
          :datetime="row.createdAt"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </template>
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="material-symbols:visibility-rounded"
          :to="'/admin/event/' + id + '/entries/' + row.id" />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin-event',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: eventEntries } = await $client.events.getEventEntries.useQuery(
  Number(id)
)

useHead({
  title: eventEntries.value?.name + ' - Entries',
})

const entriesComputed = computed(() => eventEntries.value?.entries ?? [])

const columns = [
  { key: 'id', label: '#' },
  {
    key: 'user',
    label: 'User',
  },
  {
    key: 'createdAt',
    label: 'Created At',
    sortable: true,
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]
</script>
