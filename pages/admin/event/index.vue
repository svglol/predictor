<script setup lang="ts">
const columns = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'status',
    label: 'Status',
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
  pageTransition: false,
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
    $client.eventsAdmin.getEventsPage.query({
      page: page.value,
      perPage: perPageNum.value,
    }),
  { watch: [page, perPageNum] }
)

const { data: eventCount } = await $client.eventsAdmin.getEventCount.useQuery()
const eventCountComputed = computed(() => eventCount.value ?? 0)
const eventsComputed = computed(() => events.value ?? [])

async function addEvent() {
  const event = await $client.eventsAdmin.addEvent.mutate()
  if (event) {
    navigateTo('/admin/event/' + event.id)
  }
}
</script>

<template>
  <div>
    <div
      class="flex flex-row justify-between border-b border-gray-200 p-4 dark:border-gray-800">
      <span
        class="flex flex-row items-center gap-2 text-lg font-bold text-black dark:text-white">
        Events
        <UBadge variant="subtle">{{ eventCountComputed }}</UBadge>
      </span>
      <UButton
        icon="material-symbols:add"
        size="sm"
        color="primary"
        variant="solid"
        label="Add new event"
        :trailing="false"
        class="ml-auto"
        @click="addEvent" />
    </div>
    <UTable :rows="eventsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="Edit"
          color="gray"
          variant="ghost"
          icon="material-symbols:edit"
          :to="'/admin/event/' + row.id" />
        <UButton
          v-if="row.visible"
          label="View"
          color="gray"
          variant="ghost"
          icon="material-symbols:visibility-rounded"
          :to="'/' + row.slug" />
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
    <div
      class="flex flex-row justify-between border-y border-gray-200 p-4 dark:border-gray-800">
      <USelect v-model="perPage" :options="perPages" />
      <UPagination
        v-model="page"
        :page-count="perPageNum"
        :total="eventCountComputed" />
      <div class="flex flex-row"></div>
    </div>
  </div>
</template>
