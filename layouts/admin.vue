<template>
  <NuxtLayout name="default">
    <div class="flex flex-row py-5">
      <div class="w-1/6">
        <UVerticalNavigation :links="links" />
      </div>
      <div class="w-5/6">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">

const links = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/admin/',
  },
  {
    label: 'Users',
    icon: 'i-heroicons-user',
    to: '/admin/users',
  },
  {
    label: 'Events',
    icon: 'i-heroicons-calendar-days',
    to: '/admin/events',
  },
  {
    label: 'Option Sets',
    icon: 'i-heroicons-queue-list',
    to: '/admin/options',
  }
]
</script>
