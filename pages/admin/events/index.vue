<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin",
})

const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "date",
    label: "Date",
  },
  {
    key: "predictions_close_date",
    label: "Predictions Close Date",
  },
  {
    key: "actions",
    label: "Actions",
  },
]

const { $client } = useNuxtApp()
const { data: events } = await $client.events.getEvents.useQuery()

async function addEvent() {
  let event = await $client.events.addEvent.mutate({})
  if (event) {
    navigateTo("/admin/events/" + event.id)
  }
}

function formatDate(date: Date) {
  if (date) return date.toLocaleString()
  return ""
}
</script>

<template>
  <UContainer>
    <div class="flex flex-row">
      <UButton
        icon="i-heroicons-pencil-square"
        size="sm"
        color="primary"
        variant="solid"
        label="Add new event"
        :trailing="false"
        class="ml-auto"
        @click="addEvent"
      />
    </div>

    <UTable :rows="events" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          @click="() => navigateTo('/admin/events/' + row.id)"
        />
      </template>

      <template #date-data="{ row }">
        {{ formatDate(row.event_start_date) }} -
        {{ formatDate(row.event_end_date) }}
      </template>
      <template #predictions_close_date-data="{ row }">
        {{ formatDate(row.predictions_close_date) }}
      </template>
    </UTable>
  </UContainer>
</template>
