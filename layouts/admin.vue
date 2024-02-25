<template>
  <main class="main">
    <div
      class="sticky top-0 z-50 block border-b border-gray-200 bg-white/75 p-4 backdrop-blur lg:hidden dark:border-gray-800 dark:bg-gray-900/75">
      <header class="mx-auto flex flex-wrap items-center justify-between">
        <NuxtLink to="/" class="flex h-5 flex-row items-center gap-2">
          <Logo />
        </NuxtLink>
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
        <NuxtLink
          to="/"
          class="flex h-5 flex-row items-center justify-center gap-2">
          <Logo class="sm:h-5 sm:w-5" />
          <span
            class="hidden text-xl font-light text-black sm:inline dark:text-white">
            Memespeak Predictor
          </span>
        </NuxtLink>
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
const { session } = useAuth()
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
</script>
