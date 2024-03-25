<template>
  <div v-if="user" class="flex flex-col">
    <AdminUserHeader :title="user.name">
      <UButton
        color="primary"
        icon="material-symbols:edit"
        label="Edit"
        @click="isOpen = true"
      />
    </AdminUserHeader>
    <div
      class="relative mx-auto flex h-fit w-full flex-col items-center gap-2 border-b border-gray-200 shadow dark:border-gray-800"
    >
      <NuxtImg
        v-if="user.image"
        width="1920"
        height="1080"
        fit="cover"
        :src="user.image"
        placeholder
        class="absolute inset-0 size-full rounded-t-lg object-cover"
        style="aspect-ratio: 1920 / 1080; object-fit: cover"
      />
      <div
        class="relative z-10 flex size-full flex-col items-center justify-center gap-2 bg-black bg-opacity-50 p-6 text-center text-white backdrop-blur-lg"
      >
        <UAvatar
          :src="img(user.image ?? '')"
          size="3xl"
          :alt="user.name ?? ''"
          class="ring-primary-500 ring-2"
        />
        <h1 class="text-3xl text-white">
          {{ user.name ?? '' }}
        </h1>
        <p class="text-gray-400">
          {{ user.email ?? '' }}
        </p>
      </div>
    </div>

    <div>
      <h2
        class="border-b border-gray-200 p-4 text-lg font-bold text-black dark:border-gray-800 dark:text-white"
      >
        Entered Events
      </h2>
      <UTable :columns="columns" :rows="user.entries">
        <template #actions-data="{ row }">
          <UButton
            label="Edit"
            color="gray"
            variant="ghost"
            icon="material-symbols:edit"
            :to="`/admin/event/${row.event.id}`"
          />
          <UButton
            label="View"
            color="gray"
            variant="ghost"
            icon="material-symbols:visibility-rounded"
            :to="`/${row.event.slug}`"
          />
        </template>

        <template #name-data="{ row }">
          {{ row.event.name }}
        </template>

        <template #date-data="{ row }">
          <NuxtTime
            :datetime="row.createdAt ?? ''"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric"
          />
        </template>
      </UTable>
    </div>
    <ModalUpdateUser
      v-model="isOpen"
      :name="user.name"
      :image="user.image"
      :loading="loading"
      @update="update"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  pageTransition: false,
})
const route = useRoute()
const id = route.params.id
const img = useImage()

const { data: user } = await useClient().usersAdmin.getUser.useQuery(String(id))
const loading = ref(false)

useHead({
  title: user.value?.name,
})

const columns = [
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

async function update(name: string, image: string) {
  loading.value = true
  const updatedUser = await useClient().usersAdmin.updateUser.mutate({
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
