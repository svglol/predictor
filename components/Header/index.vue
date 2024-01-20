<template>
  <div
    class="bg-background/75 border-b border-gray-200 p-4 dark:border-gray-800">
    <header
      :class="
        route.fullPath.includes('/admin/') ? '' : 'container px-0 sm:px-4'
      "
      class="mx-auto flex flex-wrap items-center justify-between">
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
            color="white"
            :label="session?.user?.name ?? ''"
            trailing-icon="i-heroicons-chevron-down-20-solid">
            <template #leading>
              <UAvatar
                :src="session?.user?.image ?? ''"
                :alt="session?.user.name ?? ''"
                size="3xs" />
            </template>
          </UButton>
        </UDropdown>
        <UButton
          color="white"
          label="Sign in"
          v-if:="status === 'unauthenticated'"
          @click="signIn('discord')" />
        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark" />

          <template #fallback>
            <div class="h-8 w-8" />
          </template>
        </ClientOnly>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { signIn, signOut, session, status, cookies } = useAuth()
const colorMode = useColorMode()
const items = ref([
  [
    {
      label: session.value?.user?.name ?? '',
      avatar: {
        src: session.value?.user?.image ?? '',
        alt: session.value?.user?.name ?? '',
      },
      to: '/profile',
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
      //@ts-expect-error any type
      (self[i] = item.filter(item2 => item2.label !== 'Admin'))
  )
}

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

const route = useRoute()
</script>
