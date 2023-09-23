<script setup lang="ts">
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
    key: 'predictions_close_date',
    label: 'Predictions Close Date',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

useHead({
  title: 'Events',
})

const { $client } = useNuxtApp()

const router = useRouter()
const route = useRoute()

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

const page = ref(1)
const perPage = ref(20)
const perPages: number[] = [10, 20, 30, 40, 50]
const perPageNum = computed(() => Number(perPage.value))
if (route.query.page) page.value = Number(route.query.page)
if (route.query.perPage) perPage.value = Number(route.query.perPage)

watch(page, () => {
  router.push({ query: { page: page.value, perPage: perPage.value } })
})
watch(perPage, () => {
  router.push({ query: { page: page.value, perPage: perPage.value } })
})

const { data: events } = await useAsyncData(
  () =>
    $client.events.getEventsPage.query({
      page: page.value,
      perPage: perPageNum.value,
    }),
  { watch: [page, perPageNum] }
)

const { data: eventCount } = await $client.events.getEventCount.useQuery()
const eventCountComputed = computed(() => eventCount.value ?? 0)
const eventsComputed = computed(() => events.value ?? [])

async function addEvent() {
  const event = await $client.events.addEvent.mutate()
  if (event) {
    navigateTo('/admin/event/' + event.id)
  }
}
</script>

<template>
  <div>
    <UTable :rows="eventsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="Edit"
          color="gray"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          :to="'/admin/event/' + row.id + '/edit'" />
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          :to="'/event/' + row.id" />
      </template>

      <template #date-data="{ row }">
        <NuxtTime
          :datetime="row.startDate"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
        -
        <NuxtTime
          :datetime="row.endDate"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </template>
      <template #predictions_close_date-data="{ row }">
        <NuxtTime
          :datetime="row.closeDate"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </template>
    </UTable>
    <div class="my-2 flex flex-row justify-between">
      <USelect v-model="perPage" :options="perPages" />
      <UPagination
        v-model="page"
        :page-count="perPageNum"
        :total="eventCountComputed" />
      <div class="flex flex-row">
        <UButton
          icon="i-heroicons-pencil-square"
          size="sm"
          color="primary"
          variant="solid"
          label="Add new event"
          :trailing="false"
          class="ml-auto"
          @click="addEvent" />
      </div>
    </div>
  </div>
</template>
