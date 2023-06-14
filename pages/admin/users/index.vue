<script setup>
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

const { data: users } = await $client.users.getUsers.useQuery()
</script>

<template>
  <UContainer>
    <UTable :rows="users" :columns="columns" class="w-full">
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
  </UContainer>
</template>
