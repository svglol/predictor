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
    key: "email",
    label: "Email",
  },
  {
    key: "role",
    label: "Role",
  },
  {
    key: "actions",
    label: "Actions",
  },
]

useHead({
  title: "Users",
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

const { data: users } = await useAsyncData(
  () =>
    $client.users.getUsers.query({
      page: page.value,
      perPage: perPageNum.value,
    }),
  { watch: [page, perPageNum] }
)

const { data: userCount } = await $client.users.getUserCount.useQuery()
const usersComputed = computed(() => users.value ?? [])
</script>

<template>
  <div>
    <UTable :rows="usersComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          :to="'/admin/users/' + row.id"
        />
      </template>
      <template #name-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.image" />
          <span>{{ row.name }}</span>
        </div>
      </template>
    </UTable>
    <div class="my-2 flex flex-row justify-between">
      <USelect v-model="perPage" :options="perPages" />
      <UPagination v-model="page" :page-count="perPageNum" :total="userCount" />
      <div />
    </div>
  </div>
</template>
