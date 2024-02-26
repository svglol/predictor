<template>
  <div
    class="sticky top-0 z-50 border-b border-gray-200 bg-white/75 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/75">
    <header
      class="container mx-auto flex flex-wrap items-center justify-between px-0 sm:px-4">
      <NuxtLink to="/" class="flex h-5 flex-row items-center gap-2">
        <Logo class="sm:h-5 sm:w-5" />
        <span
          class="hidden text-xl font-light text-black sm:inline dark:text-white">
          Memespeak Predictor
        </span>
      </NuxtLink>
      <div />
      <div class="flex justify-items-end space-x-2">
        <UDropdown
          :items="items"
          mode="click"
          :popper="{ placement: 'bottom-end' }"
          class="content-end"
          v-if:="status === 'authenticated'">
          <UButton
            color="gray"
            variant="ghost"
            :label="session?.user?.name ?? ''"
            trailing-icon="i-heroicons-chevron-down-20-solid">
            <template #leading>
              <UAvatar
                :src="
                  img(session?.user?.image ?? '', { height: 16, width: 16 })
                "
                :alt="session?.user.name ?? ''"
                size="3xs" />
            </template>
          </UButton>
        </UDropdown>
        <UButton
          color="gray"
          variant="ghost"
          label="Sign in"
          v-if:="status === 'unauthenticated'"
          @click="signIn()" />
        <UPopover
          v-if="status === 'authenticated'"
          v-model:open="notificationsOpen"
          :popper="{ placement: 'bottom-end' }">
          <UChip inset :show="(notifications?.length ?? 0) > 0">
            <UButton
              color="gray"
              icon="i-heroicons-inbox"
              variant="ghost"
              aria-label="Notifications" />
          </UChip>
          <template #panel>
            <HeaderNotificationList />
          </template>
        </UPopover>
        <HeaderDarkToggle />
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { signIn, signOut, session, status, cookies } = useAuth()

const img = useImage()
const items = computed(() => [
  [
    {
      label: session.value?.user?.name ?? '',
      avatar: {
        src: img(session.value?.user?.image ?? '', { height: 20, width: 20 }),
        alt: session.value?.user?.name ?? '',
      },
      to: `/user/${session.value?.user?.name ?? ''}`,
    },
    {
      label: 'Admin',
      icon: 'material-symbols:admin-panel-settings',
      to: '/admin/event',
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-right-on-rectangle-20-solid',
      click: () => {
        signOut()
      },
    },
  ],
])

if (session.value?.user?.role === 'USER') {
  items.value.forEach(
    (item, i, self) =>
      // @ts-expect-error any type
      (self[i] = item.filter(item2 => item2.label !== 'Admin'))
  )
}

const route = useRoute()
const { $client } = useNuxtApp()
const notifications = useState('userNotifications', () => []) as Ref<
  UserNotification[] | null
>
const notificationsOpen = ref(false)

if (status.value === 'authenticated') {
  const { data } = await $client.users.getNotifications.useQuery()
  notifications.value = data.value
  watch(
    () => route.path,
    () => {
      notificationsOpen.value = false
    }
  )
}
</script>
