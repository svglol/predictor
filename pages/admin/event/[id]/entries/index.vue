<template>
  <div>
    <UTable :rows="entriesComputed" :columns="columns" class="w-full">
      <template #user-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.user.image" />
          <span>{{ row.user.name }}</span>
        </div>
      </template>
      <template #created_at-data="{ row }">
        <ClientOnly>
          <NuxtTime
            :datetime="row.created_at"
            date-style="medium"
            time-style="long"
          />
          <template #fallback>
            <USkeleton class="h-4 w-[200px]" />
          </template>
        </ClientOnly>
      </template>
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          :to="'/admin/event/' + id + '/entries/' + row.id"
        />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route) => {
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
  title: eventEntries.value.name + " - Entries",
})

const entriesComputed = computed(() => eventEntries.value.entries ?? [])

const columns = [
  {
    key: "user",
    label: "User",
  },
  {
    key: "created_at",
    label: "Created At",
    sortable: true,
  },
  {
    key: "actions",
    label: "Actions",
  },
]
</script>

<style scoped></style>
