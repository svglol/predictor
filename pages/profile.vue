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
        :src="user.image + '?size=32' ?? ''"
        size="3xl"
        :alt="user.name ?? ''"
        class="ring-primary-500 ring-2" />
      <h1 class="text-3xl text-black dark:text-white">{{ user.name ?? '' }}</h1>
      <p class="text-gray-700 dark:text-gray-400">
        {{ user.email ?? '' }}
      </p>
    </div>
    <h2
      v-if="user.entries.length > 0"
      class="text-2xl font-bold text-black dark:text-white">
      Entered Events
    </h2>
    <div
      v-if="user.entries.length > 0"
      class="grid grid-cols-1 justify-items-stretch gap-4">
      <EventCard
        v-for="entry in user.entries"
        :key="entry.id"
        :event="entry.event" />
    </div>
    <UpdateUserModal
      v-model="isOpen"
      :user="user"
      :loading="loading"
      @update="update" />
  </div>
</template>

<script setup lang="ts">
const { $client } = useNuxtApp()

const { data: user } = await $client.users.getSessionUser.useQuery()

useHead({
  title: user.value?.name ?? '',
})
definePageMeta({
  middleware: ['auth-user'],
})
const isOpen = ref(false)
const loading = ref(false)
const update = async (name: string, image: string) => {
  loading.value = true
  const updatedUser = await $client.users.updateSessionUser.mutate({
    name,
    image,
  })
  if (user.value) {
    user.value.name = updatedUser.name
    user.value.image = updatedUser.image
  }
  loading.value = false
  isOpen.value = false
}
</script>
