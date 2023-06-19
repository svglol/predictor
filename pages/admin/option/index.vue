<template>
  <div>
    <UTable :rows="optionSetsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          :to="'/admin/option/' + row.id"
        />
      </template>

      <template #options-data="{ row }">
        {{ row.options?.length ?? 0 }}
      </template>
    </UTable>
    <div class="my-2 flex flex-row justify-between">
      <USelect v-model="perPage" :options="perPages" />
      <UPagination
        v-model="page"
        :page-count="perPageNum"
        :total="optionSetCount"
      />
      <div class="flex flex-row">
        <UButton
          icon="i-heroicons-pencil-square"
          size="sm"
          color="primary"
          variant="solid"
          label="Add new option set"
          :trailing="false"
          class="ml-auto"
          @click="addOptionSet"
        />
      </div>
    </div>
  </div>
</template>
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
    key: "title",
    label: "Title",
  },
  { key: "options", label: "Options" },
  {
    key: "actions",
    label: "Actions",
  },
]

useHead({
  title: "Option Sets",
})

const { $client } = useNuxtApp()

const router = useRouter()
const route = useRoute()

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

const { data: optionSets } = await useAsyncData(
  () =>
    $client.events.getOptionSetsPage.query({
      page: page.value,
      perPage: perPageNum.value,
    }),
  { watch: [page, perPageNum] }
)

const { data: optionSetCount } =
  await $client.events.getOptionSetCount.useQuery()
const optionSetsComputed = computed(() => optionSets.value ?? [])

async function addOptionSet() {
  let optionSet = await $client.events.addOptionSet.mutate({
    title: "New option set",
  })
  if (optionSet) {
    navigateTo("/admin/option/" + optionSet.id)
  }
}
</script>
