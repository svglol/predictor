<template>
  <div>
    <NuxtLayout name="base">
      <div class="flex-auto space-x-2 md:flex md:flex-row">
        <div
          class="w-full self-stretch border-r p-4 md:max-w-xs dark:border-slate-100/10">
          <UVerticalNavigation
            :links="links"
            :ui="{
              active:
                'text-primary-500 dark:text-primary-400 border-current font-semibold',
              inactive:
                'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
            }" />
        </div>
        <div class="w-full p-4">
          <slot />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const links = [
  {
    label: 'Events',
    icon: 'i-heroicons-calendar-days',
    to: '/admin/event',
  },
  {
    label: 'Option Sets',
    icon: 'i-heroicons-queue-list',
    to: '/admin/option',
  },
  {
    label: 'Users',
    icon: 'i-heroicons-user',
    to: '/admin/user',
  },
  {
    label: 'Discord',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
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
