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
          :to="'/admin/events/' + row.id + '/edit'"
        />
      </template>

      <template #date-data="{ row }">
        {{ useDateFormat(row.event_start_date, "YYYY-MM-DD").value }} -
        {{ useDateFormat(row.event_end_date, "YYYY-MM-DD").value }}
      </template>
      <template #predictions_close_date-data="{ row }">
        {{
          useDateFormat(row.predictions_close_date, "YYYY-MM-DD HH:mm:ss").value
        }}
      </template>
    </UTable>
  </UContainer>
</template>
