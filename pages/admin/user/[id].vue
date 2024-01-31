<template>
  <div v-if="user" class="flex flex-col gap-2">
    <div
      class="relative mx-auto flex h-fit w-full flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <div class="absolute right-0 top-0 m-2">
        <UTooltip text="Edit User">
          <UButton
            color="primary"
            variant="outline"
            icon="material-symbols:edit"
            size="2xs"
            label="Edit"
            @click="isOpen = true" />
        </UTooltip>
      </div>
      <UAvatar
        :src="user.image ?? ''"
        size="3xl"
        :alt="user.name ?? ''"
        class="ring-primary-500 ring-2" />
      <h1 class="text-3xl text-black dark:text-white">
        {{ user.name ?? '' }}
      </h1>
      <p class="text-gray-700 dark:text-gray-400">
        {{ user.email ?? '' }}
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        Entered Events
      </h2>
      <UTable :columns="columns" :rows="user.entries">
        <template #actions-data="{ row }">
          <UButton
            label="Edit"
            color="gray"
            variant="ghost"
            icon="material-symbols:edit"
            :to="'/admin/event/' + row.id + '/edit'" />
          <UButton
            label="View"
            color="gray"
            variant="ghost"
            icon="material-symbols:visibility-rounded"
            :to="'/event/' + row.slug" />
        </template>

        <template #name-data="{ row }">{{ row.event.name }}</template>

        <template #date-data="{ row }">
          <NuxtTime
            :datetime="row.createdAt ?? ''"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric" />
        </template>
      </UTable>
    </div>
    <UpdateUserModal
      v-model="isOpen"
      :user="user"
      :loading="loading"
      @update="update" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()

const { data: user } = await $client.usersAdmin.getUser.useQuery(String(id))
const loading = ref(false)

useHead({
  title: user.value?.name,
})

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
    label: 'Created At',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

const isOpen = ref(false)

const update = async (name: string, image: string) => {
  loading.value = true
  const updatedUser = await $client.usersAdmin.updateUser.mutate({
    id: user.value?.id ?? String(id),
    name,
    image,
  })
  if (user.value && updatedUser) {
    user.value.name = updatedUser.name
    user.value.image = updatedUser.image
  }
  loading.value = false
  isOpen.value = false
}
</script>
