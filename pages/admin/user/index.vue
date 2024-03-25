<template>
  <div>
    <div
      class="flex flex-row justify-between border-b border-gray-200 p-4 dark:border-gray-800"
    >
      <span
        class="flex flex-row items-center gap-2 text-lg font-bold text-black dark:text-white"
      >
        Users
        <UBadge variant="subtle">{{ userCountComputed }}</UBadge>
      </span>
    </div>
    <UTable :rows="usersComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="material-symbols:visibility-rounded"
          :to="`/admin/user/${row.id}`"
        />
      </template>
      <template #name-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="img(row.image)" :alt="row.name" />
          <span>{{ row.name }}</span>
        </div>
      </template>
      <template #role-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <USelectMenu
            v-model="selected[selected.findIndex(u => u.id === row.id)].role"
            :disabled="disabledMenu(row)"
            :options="roles"
            @update:model-value="
              update(selected[selected.findIndex(u => u.id === row.id)])
            "
          />
        </div>
      </template>
    </UTable>
    <div
      class="flex flex-row justify-between border-y border-gray-200 p-4 dark:border-gray-800"
    >
      <USelect v-model="perPage" :options="perPages" />
      <UPagination
        v-model="page"
        :page-count="perPageNum"
        :total="userCountComputed"
      />
      <div />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  pageTransition: false,
})

const columns = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'role',
    label: 'Role',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

useHead({
  title: 'Users',
})

const { session } = useAuth()

const router = useRouter()
const route = useRoute()
const toast = useToast()
const img = useImage()

const page = ref(1)
const perPage = ref(20)
const perPages: number[] = [10, 20, 30, 40, 50]
const perPageNum = computed(() => Number(perPage.value))

if (route.query.page)
  page.value = Number(route.query.page)
if (route.query.perPage)
  perPage.value = Number(route.query.perPage)

watch(page, () => {
  router.push({ query: { page: page.value, perPage: perPage.value } })
})
watch(perPage, () => {
  router.push({ query: { page: page.value, perPage: perPage.value } })
})

const { data: users } = await useAsyncData(
  () =>
    useClient().usersAdmin.getUsers.query({
      page: page.value,
      perPage: perPageNum.value,
    }),
  { watch: [page, perPageNum] },
)

const { data: userCount } = await useClient().usersAdmin.getUserCount.useQuery()
const userCountComputed = computed(() => userCount.value ?? 0)
const usersComputed = computed(() => users.value ?? [])

const roles = ['ADMIN', 'EDITOR', 'USER']
const selected = ref(
  users.value?.map((u) => {
    return { id: u.id, role: u.role }
  }) ?? [],
)

watch(usersComputed, () => {
  selected.value
    = users.value?.map((u) => {
      return { role: u.role, id: u.id }
    }) ?? []
})

function update(selected: { id: string, role: string }) {
  useClient().usersAdmin.updateUserRole.mutate(selected).then(() => {
    toast.add({ title: 'User role update successfully!' })
  })
}

function disabledMenu(row: User & { accounts: Account[] }) {
  if (session.value?.user?.role !== 'ADMIN')
    return true
  else if (session.value.user.id === row.id)
    return true
  else
    return false
}
</script>
