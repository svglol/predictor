<template>
  <div>
    <UCard :ui="{ header: { padding: '!p-0' } }">
      <template #header>
        <div class="rounded-t-lg bg-gray-100 shadow dark:bg-gray-800">
          <div class="relative h-60">
            <NuxtImg
              v-if="user?.image"
              width="1920"
              height="1080"
              fit="cover"
              :src="user?.image"
              placeholder
              class="absolute inset-0 h-full w-full rounded-t-lg object-cover"
              style="aspect-ratio: 1920 / 1080; object-fit: cover" />
            <!-- <div
              v-if="session?.user.name === name"
              class="absolute right-0 top-0 z-20 m-2">
              <UTooltip text="Edit User">
                <UButton
                  color="primary"
                  variant="outline"
                  icon="material-symbols:edit"
                  size="2xs"
                  label="Edit" />
              </UTooltip>
            </div> -->
            <div
              class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-t-lg bg-black bg-opacity-50 p-4 text-center text-white backdrop-blur-lg md:px-4">
              <UAvatar
                :src="user?.image + '?size=80' ?? ''"
                size="3xl"
                :alt="user?.name ?? ''"
                class="ring-primary-500 ring-2" />
              <h1 class="text-4xl font-bold">
                {{ name }}
              </h1>
            </div>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <span class="text-xl font-bold text-gray-700 dark:text-gray-300">
            Entered Events
          </span>
          <div
            class="grid h-full grid-cols-1 justify-items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
            <template v-for="event in events" :key="event.id">
              <EventCard
                :event="event"
                hide-badges
                show-position
                :position="
                  user?.entries.find(e => e.event.id === event.id)?.rank ?? 0
                " />
            </template>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async route => {
    return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(String(route.params.name))
  },
})
const { $client } = useNuxtApp()
const { name } = useRoute().params

const { data: user } = await $client.users.getUser.useQuery(String(name))

if (!user.value) {
  throw createError({ statusCode: 404, statusMessage: 'User not found' })
}

const events = computed(() => {
  return user.value?.entries.map(entry => entry.event)
})

useHead({
  title: user.value?.name ?? '',
})

defineOgImage({
  component: 'OgImageUser',
  props: {
    title: user.value?.name ?? '',
    src: user.value?.image ?? '',
  },
})

useSeoMeta({
  ogTitle: user.value?.name,
  twitterTitle: user.value?.name,
  twitterCard: 'summary_large_image',
})
// const { session } = useAuth()
</script>
