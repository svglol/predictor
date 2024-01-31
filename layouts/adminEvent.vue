<template>
  <div>
    <NuxtLayout name="admin">
      <div>
        <UHorizontalNavigation
          :links="links"
          class="mb-2 border-b border-gray-200 dark:border-gray-800" />
        <div>
          <slot />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)

const links = [
  { label: 'Edit', to: `/admin/event/${id.value}` },
  { label: 'Info', to: `/admin/event/${id.value}/info` },
  { label: 'Form', to: `/admin/event/${id.value}/form` },
  { label: 'Option Sets', to: `/admin/event/${id.value}/optionsets` },
  { label: 'Entries', to: `/admin/event/${id.value}/entries` },
  { label: 'Results', to: `/admin/event/${id.value}/results` },
]
</script>
