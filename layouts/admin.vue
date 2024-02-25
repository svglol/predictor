<template>
  <main class="main">
    <div
      class="sticky top-0 z-50 block border-b border-gray-200 bg-white/75 p-4 backdrop-blur lg:hidden dark:border-gray-800 dark:bg-gray-900/75">
      <header class="mx-auto flex flex-wrap items-center justify-between">
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            class="w-full"
            color="gray"
            variant="ghost"
            leading-icon="material-symbols:admin-panel-settings"
            label="Predictor Admin"
            trailing-icon="i-heroicons-chevron-down-20-solid">
            <template #trailing>
              <UIcon name="i-heroicons-chevron-down-20-solid" class="ml-auto" />
            </template>
          </UButton>
        </UDropdown>
        <div />
        <div class="flex justify-items-end space-x-2">
          <UButton
            :icon="toggleSidebar ? 'i-heroicons-x-mark' : 'i-heroicons:bars-3'"
            color="gray"
            variant="ghost"
            @click="toggleSidebar = !toggleSidebar" />
        </div>
      </header>
    </div>
    <div class="flex min-h-screen flex-auto md:flex md:flex-row">
      <AdminSidebar :links="links">
        <UVerticalNavigation
          :links="links"
          :ui="{
            active:
              'text-primary-500 dark:text-primary-400 border-current font-semibold',
            inactive:
              'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
            icon: {
              base: 'z-0',
            },
          }" />
      </AdminSidebar>
      <div
        class="hidden w-full flex-col gap-4 self-stretch border-r p-4 lg:flex lg:max-w-xs dark:border-gray-800">
        <UDropdown
          :items="items"
          :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
          mode="hover">
          <UButton
            class="w-full"
            color="gray"
            variant="ghost"
            leading-icon="material-symbols:admin-panel-settings"
            label="Predictor Admin"
            trailing-icon="i-heroicons-chevron-down-20-solid">
            <template #trailing>
              <UIcon name="i-heroicons-chevron-down-20-solid" class="ml-auto" />
            </template>
          </UButton>
        </UDropdown>
        <UDivider />
        <UVerticalNavigation
          class="w-full"
          :links="links"
          :ui="{
            icon: {
              base: 'z-0',
            },
          }" />
      </div>
      <div class="w-full">
        <slot />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { session, signOut } = useAuth()
const toggleSidebar = useState('sidebar', () => false)
const links = [
  {
    label: 'Events',
    icon: 'material-symbols:calendar-month',
    to: '/admin/event',
  },
  {
    label: 'Users',
    icon: 'material-symbols:groups-2',
    to: '/admin/user',
  },
  {
    label: 'Discord',
    icon: 'fa6-brands:discord',
    to: '/admin/discord',
  },
]
if (session.value?.user.role !== 'ADMIN') {
  links.pop()
}

useHead({
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} - Memespeak Predictor Admin`
      : 'Memespeak Predictor Admin'
  },
})
const mode = useColorMode()
const isDark = computed({
  get() {
    return mode.value === 'dark'
  },
  set() {
    mode.preference = mode.value === 'dark' ? 'light' : 'dark'
  },
})
const img = useImage()
const items = computed(() => [
  [
    {
      label: 'Predictor Admin',
      to: `/admin/`,
      icon: 'material-symbols:admin-panel-settings',
    },
    {
      label: 'Predictor Home',
      to: `/`,
      icon: 'i-heroicons-home-20-solid',
    },
  ],
  [
    {
      label: 'Toggle Theme',
      icon: isDark.value ? 'i-heroicons-moon' : 'i-heroicons-sun',
      click: () => {
        isDark.value = !isDark.value
      },
    },
  ],
  [
    {
      label: session.value?.user?.name ?? '',
      avatar: {
        src: img(session.value?.user?.image ?? '', { height: 20, width: 20 }),
        alt: session.value?.user?.name ?? '',
      },
      to: `/user/${session.value?.user?.name ?? ''}`,
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
</script>
