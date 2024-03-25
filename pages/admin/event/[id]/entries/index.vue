<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="event?.name">
      <template #badges>
        <UBadge variant="subtle">
          {{ entriesComputed.length }} Entries
        </UBadge>
        <UBadge
          v-if="(invalidEntries?.length ?? 0) > 0"
          variant="subtle"
          color="red"
        >
          {{ invalidEntries?.length }} Invalid Entries
        </UBadge>
      </template>
    </AdminEventHeader>
    <UTable :rows="entriesComputed" :columns="columns" class="w-full">
      <template #user-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="img(row.user.image)" :alt="row.user.name" />
          <span>{{ row.user.name }}</span>
        </div>
      </template>
      <template #tags-data="{ row }">
        <UBadge v-if="isInvalidEntry(row.id)" color="red" variant="subtle">
          Invalid
        </UBadge>
      </template>
      <template #id-data="{ index }">
        {{ index + 1 }}
      </template>
      <template #updated_at-data="{ row }">
        <NuxtTime
          :datetime="row.updatedAt"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
      </template>
      <template #created_at-data="{ row }">
        <NuxtTime
          :datetime="row.createdAt"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
      </template>
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="material-symbols:visibility-rounded"
          :to="`/admin/event/${id}/entries/${row.id}`"
        />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})

const route = useRoute()
const id = route.params.id
const img = useImage()

const { data: eventEntries }
  = await useClient().eventsAdmin.getEventEntries.useQuery(Number(id))
const { data: event } = await useClient().eventsAdmin.getEvent.useQuery(Number(id))
const { data: invalidEntries }
  = await useClient().eventsAdmin.invalidEntries.useQuery(Number(id))

useHead({
  title: `${eventEntries.value?.name} - Entries`,
})

const entriesComputed = computed(() => eventEntries.value?.entries ?? [])

const columns = [
  { key: 'id', label: '#' },
  {
    key: 'user',
    label: 'User',
  },
  {
    key: 'tags',
    label: 'Tags',
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

function isInvalidEntry(id: number) {
  return invalidEntries.value?.some(entry => entry.id === id)
}
</script>
