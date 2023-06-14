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

const perPage = ref(20)
const page = ref(1)

const { data: users } = await useAsyncData(
  () =>
    $client.users.getUsers.query({ page: page.value, perPage: perPage.value }),
  { watch: [page, perPage] }
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
    <div class="flex flex-row justify-center">
      <UPagination v-model="page" :page-count="perPage" :total="userCount" />
    </div>
  </div>
</template>
